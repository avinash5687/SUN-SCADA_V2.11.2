const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../config/db");

// Get real-time inverter data
router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetInverterData");

    if (id) {
      const filteredData = result.recordset.find(item => item.ID == id);
      if (!filteredData) {
        return res.status(404).json({ error: "Inverter not found" });
      }
      res.json(filteredData); // Return only the requested inverter
    } else {
      res.json(result.recordset); // Return all data if no ID is passed
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/Heatmap", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetInverterHeatMapData"); // Stored Procedure
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get chart data for inverters
router.get("/chart", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().execute("sp_GetInverterChartData");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Sample GET route
//router.get("/", (req, res) => {
//  res.json({ message: "Inverter API is working!" });
//});

//module.exports = router;
