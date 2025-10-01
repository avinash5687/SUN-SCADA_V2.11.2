const express = require("express");
const sql = require("mssql");
const router = express.Router();
require("dotenv").config();
// ✅ Redis Cache Helper
const { getOrSetCache, setNoCacheHeaders, handleError } = require("../helpers/cacheHelper");

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

// Get WMS data
router.get("/", async (req, res) => {
  try {
    const cacheKey = "wms:data";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      try {
        const result = await pool.request().execute("sp_GetWMSData");
        return result.recordset;
      } finally {
        await pool.close();
      }
    }, 60); // Cache for 1 minute

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "WMS Data");
  }
});

// Get WMS trend visualization data
router.get("/WMS-CHART", async (req, res) => {
  try {
    const cacheKey = "wms:trend";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      try {
        const result = await pool.request().execute("sp_GetWMSTrend");
        return result.recordset;
      } finally {
        await pool.close();
      }
    }, 300); // Cache for 5 minutes

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "WMS Trend");
  }
});

// Get SoilingLoss trend visualization data
router.get("/SOIL-CHART", async (req, res) => {
  try {
    const cacheKey = "wms:soiling-loss";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      try {
        const result = await pool.request().execute("sp_GetSoilingLoss");
        return result.recordset;
      } finally {
        await pool.close();
      }
    }, 300); // Cache for 5 minutes

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "SoilingLoss Trend");
  }
});

module.exports = router;
