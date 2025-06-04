const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../config/db");

// Get MFM data
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetMFMData"); // Stored Procedure
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get MFM trend visualization data
router.get("/", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetMFMTrend1"); // Stored Procedure
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
