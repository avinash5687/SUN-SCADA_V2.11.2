const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../config/db");
// ✅ Redis Cache Helper
const { getOrSetCache, setNoCacheHeaders, handleError } = require("../helpers/cacheHelper");

// Get real-time inverter data
router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    const cacheKey = id ? `inverter:data:${id}` : "inverter:data:all";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      try {
        const result = await pool.request().execute("sp_GetInverterData");
        if (id) {
          const filteredData = result.recordset.find(item => item.ID == id);
          if (!filteredData) {
            throw new Error("Inverter not found");
          }
          return filteredData; // Return only the requested inverter
        } else {
          return result.recordset; // Return all data if no ID is passed
        }
      } finally {
        await pool.close();
      }
    }, 60); // Cache for 1 minute

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "Inverter Data");
  }
});

// Get inverter heatmap data
router.get("/Heatmap", async (req, res) => {
  try {
    const cacheKey = "inverter:heatmap";
    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await sql.connect(dbConfig);
      try {
        const result = await pool.request().execute("sp_GetInverterHeatMapData");
        return result.recordset;
      } finally {
        await pool.close();
      }
    }, 300); // Cache for 5 minutes

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "Inverter Heatmap");
  }
});

module.exports = router;
