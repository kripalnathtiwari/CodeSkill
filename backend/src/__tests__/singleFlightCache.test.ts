import test from "node:test";
import assert from "node:assert/strict";
import {
  clearMemoryCacheForTests,
  getOrSetCache,
  invalidateCacheKey,
  invalidateCachePattern,
  respondWithCachedJson,
} from "../middlewares/cacheMiddleware";
import { closeAllRedisConnections } from "../lib/redis";

// Close any eager Redis connection from .env before unit tests run so cache tests
// exercise pure L1 + single-flight deterministically and exit cleanly.
test.before(async () => {
  await closeAllRedisConnections();
});

test.after(async () => {
  await closeAllRedisConnections();
});

const createMockReq = (headers: Record<string, string> = {}) =>
  ({
    headers,
    method: "GET",
  }) as any;

const createMockRes = () => {
  const resHeaders: Record<string, string> = {};
  let statusCode = 200;
  let body: any = null;
  let ended = false;

  const res: any = {
    setHeader(name: string, val: string) {
      resHeaders[name.toLowerCase()] = String(val);
    },
    getHeader(name: string) {
      return resHeaders[name.toLowerCase()];
    },
    status(code: number) {
      statusCode = code;
      return res;
    },
    send(payload: any) {
      body = payload;
      ended = true;
      return res;
    },
    end() {
      ended = true;
      return res;
    },
    get _statusCode() {
      return statusCode;
    },
    get _body() {
      return body;
    },
    get _ended() {
      return ended;
    },
  };
  return res;
};

test("single-flight coalesces 20 concurrent cache misses into one loader invocation", async () => {
  clearMemoryCacheForTests();
  let dbCalls = 0;

  const loader = async () => {
    dbCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 25));
    return { items: ["inst-1", "inst-2"] };
  };

  const results = await Promise.all(
    Array.from({ length: 20 }, () =>
      getOrSetCache("cache:/api/v1/college-management/public", 600, loader)
    )
  );

  assert.equal(dbCalls, 1);
  assert.equal(results.filter((r) => r.source === "MISS").length, 1);
  assert.equal(results.filter((r) => r.source === "HIT-COALESCED").length, 19);
  for (const r of results) {
    assert.deepEqual(r.value, { items: ["inst-1", "inst-2"] });
  }
});

test("per-user cache keys prevent User A from ever receiving User B cached payload", async () => {
  clearMemoryCacheForTests();

  const userA = await getOrSetCache("cache:user-progress:user-a", 60, async () => ({
    userId: "user-a",
    dsaSolved: ["q-1", "q-2"],
  }));

  const userB = await getOrSetCache("cache:user-progress:user-b", 60, async () => ({
    userId: "user-b",
    dsaSolved: ["q-99"],
  }));

  assert.equal(userA.value.userId, "user-a");
  assert.equal(userB.value.userId, "user-b");
  assert.notDeepEqual(userA.value.dsaSolved, userB.value.dsaSolved);

  // Re-reading User A key still returns User A only
  const userARepeat = await getOrSetCache<{ userId: string }>(
    "cache:user-progress:user-a",
    60,
    async () => {
      throw new Error("Should hit cache");
    }
  );
  assert.equal(userARepeat.value.userId, "user-a");
});

test("respondWithCachedJson returns 304 Not Modified without calling loader on ETag match", async () => {
  clearMemoryCacheForTests();
  let loaderCalls = 0;

  const res1 = createMockRes();
  await respondWithCachedJson(createMockReq(), res1, {
    key: "cache:my-notes:user-a",
    ttlSeconds: 60,
    cacheControl: "private, max-age=30",
    loader: async () => {
      loaderCalls += 1;
      return [{ id: "note-1", title: "DP Notes" }];
    },
  });

  assert.equal(loaderCalls, 1);
  assert.equal(res1._statusCode, 200);
  const etag = res1.getHeader("etag");
  assert.ok(etag);
  assert.equal(res1.getHeader("cache-control"), "private, max-age=30");

  // Second request with matching If-None-Match must short-circuit to 304 without calling loader
  const res2 = createMockRes();
  await respondWithCachedJson(createMockReq({ "if-none-match": etag }), res2, {
    key: "cache:my-notes:user-a",
    ttlSeconds: 60,
    cacheControl: "private, max-age=30",
    loader: async () => {
      loaderCalls += 1;
      return [];
    },
  });

  assert.equal(loaderCalls, 1);
  assert.equal(res2._statusCode, 304);
  assert.equal(res2._body, null);
});

test("cache invalidation clears exact keys and prefixes", async () => {
  clearMemoryCacheForTests();
  let loads = 0;

  await getOrSetCache("cache:my-notes:user-1", 60, async () => ({ v: ++loads }));
  await getOrSetCache("cache:my-notes:user-2", 60, async () => ({ v: ++loads }));

  await invalidateCachePattern("cache:my-notes:");
  const afterPrefix = await getOrSetCache("cache:my-notes:user-1", 60, async () => ({ v: ++loads }));
  assert.equal(afterPrefix.source, "MISS");
  assert.equal(afterPrefix.value.v, 3);

  await invalidateCacheKey("cache:my-notes:user-1");
  const afterKey = await getOrSetCache("cache:my-notes:user-1", 60, async () => ({ v: ++loads }));
  assert.equal(afterKey.source, "MISS");
  assert.equal(afterKey.value.v, 4);
});
