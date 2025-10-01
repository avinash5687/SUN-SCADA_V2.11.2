const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../config/db");
// ✅ Redis Cache Helper
const { getOrSetCache, setNoCacheHeaders, handleError } = require("../helpers/cacheHelper");

// Get real-time transformer data
router.get("/", async (req, res) => {
  try {
    const cacheKey = "transformer:data";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      try {
        const result = await pool.request().execute("sp_GetTrafData");
        return result.recordset;
      } finally {
        await pool.close();
      }
    }, 60); // Cache for 1 minute

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "Transformer Data");
  }
});

module.exports = router;
