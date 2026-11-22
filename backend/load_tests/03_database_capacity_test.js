const dotenv = require('dotenv');
dotenv.config();
const prisma = require('../dist/config/db').default;

async function runDatabaseCapacityAudit() {
  console.log('=====================================================');
  console.log('      DATABASE CAPACITY & POOLING AUDIT REPORT       ');
  console.log('=====================================================\n');

  try {
    // 1. Connection Pool Stats
    console.log('[1] Checking Database Connection Pool & Limits...');
    const connStats = await prisma.$queryRawUnsafe(`
      SELECT 
        (SELECT count(*)::int FROM pg_stat_activity) as current_connections,
        (SELECT count(*)::int FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*)::int FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections;
    `);
    const { current_connections, active_connections, idle_connections, max_connections } = connStats[0];
    const poolUtilization = ((current_connections / max_connections) * 100).toFixed(2);

    console.log(`  Current Connections : ${current_connections}`);
    console.log(`  Active Connections  : ${active_connections}`);
    console.log(`  Idle Connections    : ${idle_connections}`);
    console.log(`  Max Connections     : ${max_connections}`);
    console.log(`  Pool Utilization    : ${poolUtilization}%`);

    // 2. Index Utilization for Aptitude Tables
    console.log('\n[2] Checking Index Utilization on AptitudeProblem...');
    const indexStats = await prisma.$queryRawUnsafe(`
      SELECT 
        relname as table_name,
        indexrelname as index_name,
        idx_scan as number_of_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE relname = 'AptitudeProblem'
      ORDER BY idx_scan DESC;
    `);
    console.table(indexStats);

    // 3. Database Table Size & Cache Hit Ratio
    console.log('\n[3] Checking Database Cache Hit Ratio...');
    const cacheHit = await prisma.$queryRawUnsafe(`
      SELECT 
        sum(heap_blks_read) as heap_read,
        sum(heap_blks_hit) as heap_hit,
        round((sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read) + 0.00001) * 100)::numeric, 2) as cache_hit_ratio
      FROM pg_statio_user_tables;
    `);
    console.log(`  Buffer Cache Hit Ratio: ${cacheHit[0].cache_hit_ratio}%`);

    // 4. Test Concurrency Burst on Database (Connection saturation check)
    console.log('\n[4] Simulating Database Connection Pool Saturation Test...');
    const burstPromises = [];
    const burstStart = Date.now();
    const CONCURRENT_QUERIES = 50;

    for (let i = 0; i < CONCURRENT_QUERIES; i++) {
      burstPromises.push(
        prisma.aptitudeProblem.findMany({
          where: { topic: 'Percentage' },
          take: 10,
          select: { id: true, title: true, topic: true, difficulty: true }
        })
      );
    }

    const results = await Promise.allSettled(burstPromises);
    const burstDuration = Date.now() - burstStart;
    const fulfilled = results.filter(r => r.status === 'fulfilled').length;
    const rejected = results.filter(r => r.status === 'rejected').length;

    console.log(`  Executed ${CONCURRENT_QUERIES} concurrent queries in ${burstDuration} ms.`);
    console.log(`  Success : ${fulfilled}`);
    console.log(`  Failed  : ${rejected}`);
    console.log(`  Average Query Round-Trip: ${(burstDuration / CONCURRENT_QUERIES).toFixed(2)} ms`);

    console.log('\n=====================================================');
    console.log('            DATABASE AUDIT FINISHED                  ');
    console.log('=====================================================');
  } catch (err) {
    console.error('Database capacity audit error:', err);
  } finally {
    process.exit(0);
  }
}

runDatabaseCapacityAudit();
