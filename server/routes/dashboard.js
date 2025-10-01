const express = require("express");
const sql = require("mssql");
const router = express.Router();
require("dotenv").config();

// ✅ Redis Cache Helper
const { getOrSetCache, setNoCacheHeaders, handleError } = require("../helpers/cacheHelper");

// ✅ DB Configuration
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

/* -------------------- 1. Plant KPI -------------------- */
router.get("/plant-kpi", async (req, res) => {
  try {
    const cacheKey = "dashboard:plant-kpi";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("EXEC sp_GetDashboardData");
      return result.recordset;
    }, 60); // Cache for 1 min

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "Plant KPI");
  }
});

/* -------------------- 2. Device Communication -------------------- */
router.get("/device-status", async (req, res) => {
  try {
    const cacheKey = "dashboard:device-status";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("EXEC sp_Device_Comm");
      return result.recordset;
    }, 60); // Cache for 1 min

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "Device Communication");
  }
});

/* -------------------- 3. Line Chart -------------------- */
router.get("/line-chart", async (req, res) => {
  try {
    const cacheKey = "dashboard:line-chart";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("EXEC sp_GetTrendData");
      return result.recordset;
    }, 300); // Cache for 5 min

    res.json(data);
  } catch (err) {
    handleError(res, err, "Line Chart");
  }
});

/* -------------------- 4. Bar Chart (Day) -------------------- */
router.get("/bar-chart", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "Date parameter is required" });

    const cacheKey = `dashboard:bar-chart:${date}`;
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      const result = await pool
        .request()
        .input("SelectedDate", sql.Date, date)
        .query("EXEC sp_GetBarTrendData @SelectedDate");
      return result.recordset;
    }, 300); // Cache for 5 min

    res.json(data);
  } catch (err) {
    handleError(res, err, "Bar Chart (Day)");
  }
});

/* -------------------- 5. Bar Chart (Week) -------------------- */
router.get("/bar-chart1", async (req, res) => {
  try {
    const cacheKey = "dashboard:bar-chart1:week";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("EXEC sp_GetBarTrendData1");
      return result.recordset;
    }, 600); // Cache for 10 min

    res.json(data);
  } catch (err) {
    handleError(res, err, "Bar Chart (Week)");
  }
});

/* -------------------- 6. Bar Chart (Month) -------------------- */
router.get("/bar-chart2", async (req, res) => {
  try {
    const cacheKey = "dashboard:bar-chart2:month";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("EXEC sp_GetBarTrendData2");
      return result.recordset;
    }, 900); // Cache for 15 min

    res.json(data);
  } catch (err) {
    handleError(res, err, "Bar Chart (Month)");
  }
});

/* -------------------- 7. Bar Chart (Year) -------------------- */
router.get("/bar-chart3", async (req, res) => {
  try {
    const cacheKey = "dashboard:bar-chart3:year";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("EXEC sp_GetBarTrendData3");
      return result.recordset;
    }, 1800); // Cache for 30 min

    res.json(data);
  } catch (err) {
    handleError(res, err, "Bar Chart (Year)");
  }
});

/* -------------------- 8. WMS Data -------------------- */
router.get("/WMSDATA-DASH", async (req, res) => {
  try {
    const cacheKey = "dashboard:wmsdata";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query("EXEC sp_GetWMSDataDash");
      return result.recordset;
    }, 60); // Cache for 1 min

    res.json(data);
  } catch (err) {
    handleError(res, err, "WMS Data");
  }
});

module.exports = router;
