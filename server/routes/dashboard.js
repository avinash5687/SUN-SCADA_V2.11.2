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

// ✅ Fetch Plant KPI Data
router.get("/plant-kpi", async (req, res) => {
  try {
    // 🔹 Create a new connection pool for each request
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("EXEC sp_GetDashboardData");    
    console.log("DB Response:", result.recordset);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Plant KPI:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch All Device Communication
router.get("/device-status", async (req, res) => {
  try {
    // 🔹 Create a new connection pool for each request
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("EXEC sp_Device_Comm");    
    console.log("DB Response:", result.recordset);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Plant KPI:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch Line Chart Data
router.get("/line-chart", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("EXEC sp_GetTrendData");    
    console.log("Line Chart Data:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Line Chart Data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch Bar Chart Data with Date Parameter
router.get("/bar-chart", async (req, res) => {
  try {
    const { date } = req.query; // Get date from frontend request
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("SelectedDate", sql.Date, date) // Pass date as input parameter
      .query("EXEC sp_GetBarTrendData @SelectedDate");
    console.log("Bar Chart Data:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Bar Chart Data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch Bar Chart Data WEEK
router.get("/bar-chart1", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("EXEC sp_GetBarTrendData1");    
    console.log("Bar Chart Data:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Bar Chart Data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch Bar Chart Data MONTH
router.get("/bar-chart2", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("EXEC sp_GetBarTrendData2");    
    console.log("Bar Chart Data:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Bar Chart Data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch Bar Chart Data YEAR
router.get("/bar-chart3", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("EXEC sp_GetBarTrendData3");    
    console.log("Bar Chart Data:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Bar Chart Data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Fetch WMS DATA
router.get("/WMSDATA-DASH", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("EXEC sp_GetWMSDataDash");    
    console.log("Bar Chart Data:", result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching Bar Chart Data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
