const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6379", // change if hosted elsewhere
  retry_strategy: () => null, // Disable retries
});

redisClient.on("error", (err) => {
  if (err.code !== 'ECONNREFUSED') {
    console.error("Redis Client Error", err);
  }
  redisClient.isConnected = false;
});

redisClient.on("connect", () => {
  console.log("✅ Redis connected");
  redisClient.isConnected = true;
});

redisClient.on("ready", () => {
  console.log("✅ Redis ready");
  redisClient.isConnected = true;
});

redisClient.on("end", () => {
  console.log("❌ Redis connection ended");
  redisClient.isConnected = false;
});

// Try to connect asynchronously
redisClient.connect().catch((err) => {
  console.log("❌ Redis connection failed, continuing without cache");
  redisClient.isConnected = false;
});

module.exports = redisClient;
