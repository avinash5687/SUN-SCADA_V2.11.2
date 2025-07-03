const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,  // ✅ Added User
    password: process.env.DB_PASSWORD,  // ✅ Added Password
    options: {
        encrypt: false, 
        trustServerCertificate: true, 
        enableArithAbort: true
    },
    requestTimeout: 0, // 🔥 Set SQL timeout to unlimited
    pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    }
};

let poolPromise;

async function getDbPool() {
    if (!poolPromise) {
        try {
            console.log("🔍 Connecting to MSSQL...");
            poolPromise = new sql.ConnectionPool(dbConfig);
            await poolPromise.connect();
            console.log("✅ MSSQL Connection Established using SQL Authentication");
        } catch (error) {
            console.error("❌ DB Connection Error:", error);
            poolPromise = null;
        }
    }
    return poolPromise;
}

module.exports = { getDbPool, sql };

// ✅ Debugging Check
console.log("✅ db.js Loaded");
