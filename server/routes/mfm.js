const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../config/db");
// ✅ Redis Cache Helper
const { getOrSetCache, setNoCacheHeaders, handleError } = require("../helpers/cacheHelper");

// GET MFM data (with optional ID filter)
router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    const cacheKey = id ? `mfm:data:${id}` : "mfm:data:all";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      try {
        const result = await pool.request().execute("sp_GetMFMData");
        if (id) {
          const filtered = result.recordset.find(item => item.ID == id);
          if (!filtered) {
            throw new Error("MFM not found");
          }
          return filtered; // Return only one MFM's data
        } else {
          return result.recordset; // Return all MFMs
        }
      } finally {
        await pool.close();
      }
    }, 60); // Cache for 1 minute

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "MFM Data");
  }
});

// Trend visualization endpoint
router.get("/trend", async (req, res) => {
  try {
    const cacheKey = "mfm:trend";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      try {
        const result = await pool.request().execute("sp_GetMFMTrend1");
        return result.recordset;
      } finally {
        await pool.close();
      }
    }, 300); // Cache for 5 minutes

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "MFM Trend");
  }
});

module.exports = router;
