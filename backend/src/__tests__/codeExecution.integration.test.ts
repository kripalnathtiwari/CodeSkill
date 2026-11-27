/**
 * Integration test verifying BullMQ idempotency (`sub-${submissionId}`) and
 * retry recovery against a real Redis instance (`TEST_REDIS_URL` or `127.0.0.1:6379`).
 * Skips cleanly when local Redis is unavailable so offline CI/unit runs stay green.
 */
import test from "node:test";
import assert from "node:assert/strict";
import Redis from "ioredis";
import { Queue, Worker } from "bullmq";

const TEST_REDIS_URL = process.env.TEST_REDIS_URL || "redis://127.0.0.1:6379";

const canReachLocalRedis = async (): Promise<boolean> => {
  const client = new Redis(TEST_REDIS_URL, {
    maxRetriesPerRequest: 1,
    connectTimeout: 800,
    retryStrategy: () => null,
    lazyConnect: true,
  });
  try {
    await client.connect();
    await client.ping();
    return true;
  } catch {
    return false;
  } finally {
    client.disconnect();
  }
};

test("code-execution queue deduplicates by jobId and retries transient failures", async (t) => {
  const available = await canReachLocalRedis();
  if (!available) {
    t.skip(`Local Redis not reachable at ${TEST_REDIS_URL}; start Redis to run integration tests.`);
    return;
  }

  const prefix = `test:bull:${Date.now()}`;
  const queueConn = new Redis(TEST_REDIS_URL, { maxRetriesPerRequest: null });
  const workerConn = new Redis(TEST_REDIS_URL, { maxRetriesPerRequest: null });

  const queue = new Queue("code-execution-it", {
    connection: queueConn as any,
    prefix,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: "fixed", delay: 100 },
    },
  });

  let executions = 0;
  let completedResolver: ((value: unknown) => void) | null = null;
  const completedPromise = new Promise((resolve) => {
    completedResolver = resolve;
  });

  const worker = new Worker(
    "code-execution-it",
    async () => {
      executions += 1;
      if (executions === 1) {
        throw new Error("Simulated transient Judge0 503");
      }
      return { status: "ACCEPTED" };
    },
    { connection: workerConn as any, prefix, concurrency: 1 }
  );

  worker.on("completed", (job, result) => {
    if (completedResolver) completedResolver({ id: job.id, result });
  });

  try {
    const submissionId = "sub-12345";
    await queue.add("execute-submission", { submissionId }, { jobId: `sub-${submissionId}` });
    await queue.add("execute-submission", { submissionId }, { jobId: `sub-${submissionId}` });

    const done = (await completedPromise) as { id: string; result: { status: string } };
    assert.equal(done.id, `sub-${submissionId}`);
    assert.equal(done.result.status, "ACCEPTED");
    assert.equal(executions, 2); // 1 failed attempt + 1 successful retry; duplicate enqueue ignored
  } finally {
    await worker.close();
    await queue.obliterate({ force: true });
    await queue.close();
    await workerConn.quit();
    await queueConn.quit();
  }
});
