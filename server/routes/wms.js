const express = require("express");
const sql = require("mssql");
const router = express.Router();
require("dotenv").config();

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
  }
};
// Get WMS data
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetWMSData"); // Stored Procedure
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get WMS trend visualization data
router.get("/WMS-CHART", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetWMSTrend"); // Stored Procedure
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get SollingLoss trend visualization data
router.get("/SOIL-CHART", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetSoilingLoss"); // Stored Procedure
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
