const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../config/db");

// GET MFM data (with optional ID filter)
router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetMFMData"); // returns all 8 MFMs

    if (id) {
      const filtered = result.recordset.find(item => item.ID == id);
      if (!filtered) {
        return res.status(404).json({ error: "MFM not found" });
      }
      res.json(filtered); // return only one MFM's data
    } else {
      res.json(result.recordset); // return all MFMs
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trend visualization endpoint (separate)
router.get("/trend", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetMFMTrend1");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
