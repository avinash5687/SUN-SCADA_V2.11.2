const sql = require("mssql");

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
    requestTimeout: 30000, // Set timeout to 30 seconds
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
            throw error; // Re-throw the error to be caught by the caller
        }
    }
    return poolPromise;
}

module.exports = { getDbPool, sql };

// ✅ Debugging Check
console.log("✅ db.js Loaded");
