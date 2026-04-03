import Redis from "ioredis";

// Redis is optional — if REDIS_URL is not set or connection fails,
// the app falls back to direct DB queries silently.
let _client = null;
let _ready = false;

export function getRedis() {
  return _ready ? _client : null;
}

export function initRedis() {
  const url = process.env.REDIS_URL || "redis://localhost:6379";

  _client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
  });

  _client.on("connect", () => {
    _ready = true;
    console.log("Redis connected");
  });

  _client.on("error", (err) => {
    if (_ready) {
      _ready = false;
      console.warn("Redis disconnected:", err.message);
    }
  });

  _client.on("ready", () => {
    _ready = true;
  });

  _client.connect().catch(() => {
    console.warn("Redis not available — falling back to DB-only mode");
  });
}

// TTLs
export const TTL = {
  DM_HISTORY: 60 * 5, // 5 min
  GROUP_HISTORY: 60 * 5, // 5 min
  CONVERSATIONS: 60 * 2, // 2 min
  ONLINE_USERS: 60 * 60 * 24, // 24 h (refresh on connect/disconnect)
};

// ── Cache helpers ──────────────────────────────────────────────────────────

export async function cacheGet(key) {
  const r = getRedis();
  if (!r) return null;
  try {
    const val = await r.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds) {
  const r = getRedis();
  if (!r) return;
  try {
    await r.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {}
}

export async function cacheDel(key) {
  const r = getRedis();
  if (!r) return;
  try {
    await r.del(key);
  } catch {}
}

export async function cacheDelPattern(pattern) {
  const r = getRedis();
  if (!r) return;
  try {
    const keys = await r.keys(pattern);
    if (keys.length) await r.del(...keys);
  } catch {}
}

// ── Online-user set backed by Redis ───────────────────────────────────────

const ONLINE_KEY = "chat:online_users";

export async function redisAddOnline(userId) {
  const r = getRedis();
  if (!r) return;
  try {
    await r.sadd(ONLINE_KEY, userId);
    await r.expire(ONLINE_KEY, TTL.ONLINE_USERS);
  } catch {}
}

export async function redisRemoveOnline(userId) {
  const r = getRedis();
  if (!r) return;
  try {
    await r.srem(ONLINE_KEY, userId);
  } catch {}
}

export async function redisGetOnlineUsers() {
  const r = getRedis();
  if (!r) return new Set();
  try {
    const members = await r.smembers(ONLINE_KEY);
    return new Set(members);
  } catch {
    return new Set();
  }
}
