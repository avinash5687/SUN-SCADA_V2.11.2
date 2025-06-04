const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function testConnection() {
  try {
    await sql.connect(dbConfig);
    console.log("✅ Database Connected Successfully!");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
  }
}

testConnection();
