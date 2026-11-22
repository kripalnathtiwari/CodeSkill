const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const redis = require('../dist/config/redis').default;
const prisma = require('../dist/config/db').default;

const JWT_SECRET = process.env.JWT_SECRET || 'developmentsupersecretkey1234!';
const BASE_URL = 'http://127.0.0.1:5000';

// High-capacity HTTP agent to prevent client-side port exhaustion or socket bottlenecks
const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 1000,
  timeout: 30000,
});

function calculatePercentiles(latencies) {
  if (latencies.length === 0) return { min: 0, p50: 0, p90: 0, p95: 0, p99: 0, max: 0, mean: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  return {
    min: sorted[0],
    p50: sorted[Math.floor(sorted.length * 0.50)],
    p90: sorted[Math.floor(sorted.length * 0.90)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    max: sorted[sorted.length - 1],
    mean: Math.round(sum / sorted.length),
  };
}

// Single HTTP Request Helper
function sendRequest(options, postData = null) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.request(
      {
        ...options,
        agent: httpAgent,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const duration = Date.now() - start;
          resolve({
            statusCode: res.statusCode,
            duration,
            body,
            error: null,
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        duration: Date.now() - start,
        body: null,
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 408,
        duration: Date.now() - start,
        body: null,
        error: 'Timeout',
      });
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

// Prepare synthetic student credentials and active Redis sessions
async function seedStudentSessions(count) {
  console.log(`[Seed] Generating and pipelining ${count} active student sessions into Redis...`);
  const students = [];
  const pipeline = redis.pipeline();

  for (let i = 1; i <= count; i++) {
    const userId = `12de874c-9ce4-4e72-9188-0fe6667e3c2d`; // Valid UUID matching db test user
    const sessionId = `loadtest-sess-${crypto.randomUUID()}`;
    const token = jwt.sign(
      {
        id: userId,
        email: `student_${i}@loadtest.codeskill.com`,
        role: 'STUDENT',
        sessionId,
      },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    students.push({ id: userId, sessionId, token, index: i });
    pipeline.set(
      `session:${sessionId}`,
      JSON.stringify({
        status: 'active',
        active: true,
        user: {
          id: userId,
          email: `student_${i}@loadtest.codeskill.com`,
          role: 'STUDENT',
        },
      }),
      'EX',
      7200
    );
  }

  await pipeline.exec();
  console.log(`[Seed] Successfully seeded ${count} sessions in Redis.`);
  return students;
}

// Clean up seeded sessions
async function cleanupSessions(students) {
  const pipeline = redis.pipeline();
  students.forEach((s) => pipeline.del(`session:${s.sessionId}`));
  await pipeline.exec();
  console.log(`[Cleanup] Removed ${students.length} test sessions from Redis.`);
}

// Simulate one student completing the 60-question examination workflow
async function simulateStudentExam(student, stats) {
  // Step 1: Session Status Check
  const sessRes = await sendRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/auth/session-status',
    method: 'GET',
    headers: { Authorization: `Bearer ${student.token}` },
  });
  stats.record('session-status', sessRes);

  // Step 2: Simultaneous Test Start (Fetch 60 MCQ questions)
  const qRes = await sendRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/aptitude-problems?topic=Percentage&limit=60',
    method: 'GET',
    headers: { Authorization: `Bearer ${student.token}` },
  });
  stats.record('aptitude-problems', qRes);

  // Step 3: Fetch aggregates
  const aggRes = await sendRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/v1/aptitude-problems/metadata/aggregates',
    method: 'GET',
  });
  stats.record('aggregates', aggRes);

  // Step 4: Answer autosaves (simulating 2 progress sync checkpoints)
  for (let save = 1; save <= 2; save++) {
    const saveRes = await sendRequest(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/v1/auth/user-progress',
        method: 'POST',
        headers: { Authorization: `Bearer ${student.token}` },
      },
      {
        aptitudeAnalytics: {
          Percentage: { attempted: save * 15, correct: save * 12, total: 60 },
        },
      }
    );
    stats.record('user-progress-autosave', saveRes);
  }

  // Step 5: Final Simultaneous Test Submission (60 questions completed)
  const finalSubmitRes = await sendRequest(
    {
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/v1/auth/user-progress',
      method: 'POST',
      headers: { Authorization: `Bearer ${student.token}` },
    },
    {
      aptitudeAnalytics: {
        Percentage: { attempted: 60, correct: 51, total: 60 },
      },
      testScores: {
        lastAptitudeScore: { score: 51, total: 60, percentage: 85, submittedAt: new Date().toISOString() },
      },
    }
  );
  stats.record('user-progress-final-submit', finalSubmitRes);
}

// Metrics Collector Class
class MetricsCollector {
  constructor(stageName) {
    this.stageName = stageName;
    this.latencies = [];
    this.statusCounts = {};
    this.errors = [];
    this.endpointLatencies = {
      'session-status': [],
      'aptitude-problems': [],
      'aggregates': [],
      'user-progress-autosave': [],
      'user-progress-final-submit': [],
    };
    this.startTime = Date.now();
    this.endTime = null;
  }

  record(endpoint, res) {
    this.latencies.push(res.duration);
    if (this.endpointLatencies[endpoint]) {
      this.endpointLatencies[endpoint].push(res.duration);
    }
    const code = res.statusCode || 'ERR';
    this.statusCounts[code] = (this.statusCounts[code] || 0) + 1;
    if (res.error || res.statusCode >= 500) {
      this.errors.push({ endpoint, code, err: res.error });
    }
  }

  finish() {
    this.endTime = Date.now();
  }

  printSummary(totalStudents) {
    const durationSec = ((this.endTime - this.startTime) / 1000).toFixed(2);
    const totalRequests = this.latencies.length;
    const rps = (totalRequests / (durationSec || 1)).toFixed(1);
    const overallPerc = calculatePercentiles(this.latencies);

    console.log(`\n======================================================================`);
    console.log(`  STAGE RESULTS: ${this.stageName.toUpperCase()}`);
    console.log(`======================================================================`);
    console.log(`  Concurrent Students: ${totalStudents}`);
    console.log(`  Total Requests:      ${totalRequests}`);
    console.log(`  Duration:            ${durationSec} s`);
    console.log(`  Throughput:          ${rps} req/sec`);
    console.log(`  HTTP Statuses:       ${JSON.stringify(this.statusCounts)}`);
    console.log(`  Errors / Failures:   ${this.errors.length}`);
    console.log(`----------------------------------------------------------------------`);
    console.log(`  OVERALL LATENCY:`);
    console.log(`    Min: ${overallPerc.min}ms | p50: ${overallPerc.p50}ms | p90: ${overallPerc.p90}ms | p95: ${overallPerc.p95}ms | p99: ${overallPerc.p99}ms | Max: ${overallPerc.max}ms`);
    console.log(`----------------------------------------------------------------------`);
    console.log(`  PER-ENDPOINT LATENCY BREAKDOWN (p50 / p95 / p99):`);
    for (const [ep, arr] of Object.entries(this.endpointLatencies)) {
      const p = calculatePercentiles(arr);
      console.log(`    - ${ep.padEnd(28)}: p50: ${String(p.p50).padStart(4)}ms | p95: ${String(p.p95).padStart(4)}ms | p99: ${String(p.p99).padStart(4)}ms | reqs: ${arr.length}`);
    }
    console.log(`======================================================================\n`);

    return {
      stage: this.stageName,
      students: totalStudents,
      totalRequests,
      durationSec,
      rps,
      statusCounts: this.statusCounts,
      errors: this.errors.length,
      overall: overallPerc,
      endpoints: Object.fromEntries(
        Object.entries(this.endpointLatencies).map(([ep, arr]) => [ep, calculatePercentiles(arr)])
      ),
    };
  }
}

async function runStage(stageName, concurrentCount, students) {
  console.log(`\n>>> STARTING STAGE: ${stageName} (${concurrentCount} Students) <<<`);
  const stats = new MetricsCollector(stageName);
  const activeSlice = students.slice(0, concurrentCount);

  // Execute all concurrent student examination flows
  await Promise.all(activeSlice.map((student) => simulateStudentExam(student, stats)));

  stats.finish();
  return stats.printSummary(concurrentCount);
}

// 1,000 DAU simulation (staggered arrivals over 20 waves)
async function runDauSimulation(totalStudents, students) {
  console.log(`\n>>> STARTING 1,000 DAU EXAM SIMULATION (Staggered Cohorts) <<<`);
  const stats = new MetricsCollector('1000 DAU Staggered');
  const cohortSize = 50;
  const numCohorts = Math.ceil(totalStudents / cohortSize);

  for (let c = 0; c < numCohorts; c++) {
    const cohort = students.slice(c * cohortSize, (c + 1) * cohortSize);
    console.log(`  -> Dispatching Cohort ${c + 1}/${numCohorts} (${cohort.length} students)...`);
    await Promise.all(cohort.map((student) => simulateStudentExam(student, stats)));
    // Realistic inter-arrival pause between cohorts
    await new Promise((r) => setTimeout(r, 200));
  }

  stats.finish();
  return stats.printSummary(totalStudents);
}

async function main() {
  console.log('######################################################################');
  console.log('       CODESKILL LMS - FULL PRODUCTION LOAD & RELIABILITY AUDIT       ');
  console.log('######################################################################');

  // Verify DB connection & pool capacity
  const dbHealth = await prisma.$queryRawUnsafe('SELECT version(), current_setting(\'max_connections\') as max_conns;');
  console.log(`PostgreSQL Engine: ${dbHealth[0].version.split(' on ')[0]}`);
  console.log(`PostgreSQL Max Connections: ${dbHealth[0].max_conns}`);

  // Seed 1,000 students in Redis
  const totalStudents = 1000;
  const students = await seedStudentSessions(totalStudents);

  const reports = [];

  try {
    // 1. 100 Concurrent Students
    reports.push(await runStage('100 Concurrent Students', 100, students));

    // 2. 250 Concurrent Students
    reports.push(await runStage('250 Concurrent Students', 250, students));

    // 3. 500 Concurrent Students
    reports.push(await runStage('500 Concurrent Students', 500, students));

    // 4. 1,000 DAU Staggered Examination Simulation
    reports.push(await runDauSimulation(1000, students));

    console.log('\n======================================================================');
    console.log('                    FINAL MULTI-STAGE COMPARISON MATRIX               ');
    console.log('======================================================================');
    console.table(
      reports.map((r) => ({
        Stage: r.stage,
        Students: r.students,
        Requests: r.totalRequests,
        Throughput_RPS: r.rps,
        p50_ms: r.overall.p50,
        p95_ms: r.overall.p95,
        p99_ms: r.overall.p99,
        Failures: r.errors,
      }))
    );
  } finally {
    await cleanupSessions(students);
    await prisma.$disconnect();
    redis.disconnect();
    console.log('\n[Finished] Benchmark complete. Database and cache connections closed.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal load testing error:', err);
  process.exit(1);
});
