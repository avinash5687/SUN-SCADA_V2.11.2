const redisClient = require("../config/redisClient");
const CACHE_TTL = 60; // Default TTL in seconds

async function getOrSetCache(key, fetchFunction, ttl = CACHE_TTL) {
  const cachedData = await redisClient.get(key);
  if (cachedData) {
    console.log(`✅ Returning ${key} from cache`);
    return JSON.parse(cachedData);
  }
  console.log(`⏳ Fetching fresh data for ${key}`);
  const freshData = await fetchFunction();
  await redisClient.setEx(key, ttl, JSON.stringify(freshData));
  console.log(`✅ Cached ${key} in Redis`);
  return freshData;
}

function setNoCacheHeaders(res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function handleError(res, err, context) {
  console.error(`❌ Error fetching ${context}:`, err);
  res.status(500).json({ error: "Internal Server Error" });
}

module.exports = { getOrSetCache, setNoCacheHeaders, handleError };
