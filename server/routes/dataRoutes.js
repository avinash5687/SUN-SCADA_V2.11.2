const express = require("express");
const sql = require("mssql");
const router = express.Router();
const dbConfig = require("../config/db");
// ✅ Redis Cache Helper
const { getOrSetCache, setNoCacheHeaders, handleError } = require("../helpers/cacheHelper");

// Fetch Current Energy Data using Stored Procedure
router.get("/energy-data", async (req, res) => {
  try {
    const cacheKey = "dashboard:energy-data";
    const data = await getOrSetCache(cacheKey, async () => {
      let pool;
      try {
        // Connect to the database
        pool = await sql.connect(dbConfig);
        // Execute the stored procedure
        const result = await pool.request().execute("sp_GetDashboardData");
        if (result.recordset.length > 0) {
          return result.recordset[0]; // Return first row of data
        } else {
          throw new Error("No data found");
        }
      } finally {
        // Close the connection only if it was established
        if (pool) {
          await pool.close();
        }
      }
    }, 60); // Cache for 1 minute

    setNoCacheHeaders(res);
    res.json(data);
  } catch (err) {
    handleError(res, err, "Energy Data");
  }
});

module.exports = router;
