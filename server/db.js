const sql = require("mssql");
const dotenv = require("dotenv");
const os = require("os");

dotenv.config();

// 💡 Check if you're running locally (using process.env.HOST or fallback to hostname check)
const isLocal = process.env.HOST?.includes("localhost") ||
                process.env.HOST?.includes("127.0.0.1") ||
                os.hostname().toLowerCase().includes("desktop") || // common local hostnames
                os.hostname().toLowerCase().includes("lap") || 
                process.env.NODE_ENV === "development";

// ✅ Decide DB server based on whether you're local or remote
const dbServer = isLocal ? "localhost" : "103.102.234.177";

const dbConfig = {
  server: dbServer,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  requestTimeout: 0,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

async function getDbPool() {
  if (!poolPromise) {
    try {
      console.log(`🔍 Connecting to MSSQL at ${dbConfig.server}...`);
      poolPromise = new sql.ConnectionPool(dbConfig);
      await poolPromise.connect();
      console.log("✅ MSSQL Connection Established");
    } catch (error) {
      console.error("❌ DB Connection Error:", error);
      poolPromise = null;
    }
  }
  return poolPromise;
}

module.exports = { getDbPool, sql };
