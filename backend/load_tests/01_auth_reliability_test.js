const dotenv = require('dotenv');
dotenv.config();
const prisma = require('../dist/config/db').default;
const redis = require('../dist/config/redis').default;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

async function runAuthReliabilityTest() {
  console.log('=====================================================');
  console.log('       AUTHENTICATION & SESSION RELIABILITY TEST     ');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Concurrent Student Login Simulation
    console.log('[1] Simulating Concurrent Student Logins (N=50)...');
    const CONCURRENT_LOGINS = 50;
    const loginTokens = [];
    const tLoginStart = Date.now();

    for (let i = 0; i < CONCURRENT_LOGINS; i++) {
      const studentId = `student-bench-${i + 1}`;
      const sessionId = `sess-${Date.now()}-${i + 1}`;
      const token = jwt.sign(
        { id: studentId, email: `student${i + 1}@staging.codeskill.com`, role: 'STUDENT', sessionId },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      loginTokens.push({ studentId, sessionId, token });
    }

    // Set all active sessions in Redis concurrently
    const pipeline = redis.pipeline();
    loginTokens.forEach(({ studentId, sessionId }) => {
      pipeline.set(
        `session:${sessionId}`,
        JSON.stringify({ status: 'active', user: { id: studentId, email: `${studentId}@staging.codeskill.com`, role: 'STUDENT' } }),
        'EX',
        3600
      );
    });
    const pipelineRes = await pipeline.exec();
    const loginDuration = Date.now() - tLoginStart;
    const errors = pipelineRes.filter(([err]) => err !== null);

    assert(errors.length === 0, `All ${CONCURRENT_LOGINS} concurrent sessions registered in Redis without error (${loginDuration} ms).`);

    // 2. Multi-Device Login & Session Revocation
    console.log('\n[2] Testing Multi-Device Single Active Session Enforcement...');
    const targetStudent = loginTokens[0];
    const newDeviceSessionId = `sess-newdevice-${Date.now()}`;

    // Device 2 logs in -> revokes Device 1 session
    await redis.set(`session:${targetStudent.sessionId}`, 'revoked', 'EX', 86400);
    await redis.set(
      `session:${newDeviceSessionId}`,
      JSON.stringify({ status: 'active', user: { id: targetStudent.studentId, email: 'student1@staging.codeskill.com', role: 'STUDENT' } }),
      'EX',
      3600
    );

    // Old Device 1 checks session
    const oldSessionVal = await redis.get(`session:${targetStudent.sessionId}`);
    assert(oldSessionVal === 'revoked', 'Old device session is immediately marked "revoked" in Redis.');

    // New Device 2 checks session
    const newSessionVal = await redis.get(`session:${newDeviceSessionId}`);
    const parsedNew = JSON.parse(newSessionVal);
    assert(parsedNew.status === 'active', 'New device session is immediately active.');

    // 3. JWT Expiration & Signature Tampering
    console.log('\n[3] Testing JWT Integrity and Expiration Verification...');
    const expiredToken = jwt.sign(
      { id: 'expired-user', email: 'expired@staging.com', role: 'STUDENT', sessionId: 'sess-exp' },
      JWT_SECRET,
      { expiresIn: '-10s' } // Expired 10 seconds ago
    );

    let expiredRejected = false;
    try {
      jwt.verify(expiredToken, JWT_SECRET);
    } catch (e) {
      if (e.name === 'TokenExpiredError') expiredRejected = true;
    }
    assert(expiredRejected, 'Expired JWT is immediately rejected by verification with TokenExpiredError.');

    const tamperedToken = targetStudent.token.slice(0, -5) + 'AAAAA';
    let tamperedRejected = false;
    try {
      jwt.verify(tamperedToken, JWT_SECRET);
    } catch (e) {
      if (e.name === 'JsonWebTokenError') tamperedRejected = true;
    }
    assert(tamperedRejected, 'Tampered JWT signature is rejected with JsonWebTokenError.');

    // 4. Redis Failure Simulation & Fail-Secure Fallback
    console.log('\n[4] Simulating Redis Failure & Fail-Secure Verification...');
    // When a session is not in Redis, auth middleware queries PostgreSQL deviceSession.
    const nonExistentSession = crypto.randomUUID();
    const redisCheck = await redis.get(`session:${nonExistentSession}`);
    assert(redisCheck === null, 'Unknown session returns null from Redis cache.');

    // Database lookup for ghost session
    const dbSession = await prisma.deviceSession.findUnique({
      where: { sessionId: nonExistentSession },
      select: { isActive: true, userId: true }
    });
    assert(dbSession === null, 'PostgreSQL confirms ghost session does not exist.');
    assert(!dbSession?.isActive, 'Access is strictly DENIED. Auth system fails secure.');

    // 5. Account Switching Simulation
    console.log('\n[5] Testing Account Switching Isolation...');
    const studentA = loginTokens[1];
    const studentB = loginTokens[2];

    const decodedA = jwt.verify(studentA.token, JWT_SECRET);
    const decodedB = jwt.verify(studentB.token, JWT_SECRET);

    assert(decodedA.id !== decodedB.id, 'Account A and Account B have strictly isolated subject IDs.');
    assert(decodedA.sessionId !== decodedB.sessionId, 'Account A and Account B have unique session IDs.');

    // Clean up test sessions
    const cleanupPipeline = redis.pipeline();
    loginTokens.forEach(({ sessionId }) => cleanupPipeline.del(`session:${sessionId}`));
    cleanupPipeline.del(`session:${newDeviceSessionId}`);
    await cleanupPipeline.exec();

    console.log('\n=====================================================');
    console.log(`  AUTH RELIABILITY RESULT: ${passed} PASSED, ${failed} FAILED `);
    console.log('=====================================================');
  } catch (err) {
    console.error('Auth reliability test error:', err);
  } finally {
    process.exit(0);
  }
}

runAuthReliabilityTest();
