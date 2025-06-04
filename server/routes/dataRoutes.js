const express = require("express");
const sql = require("mssql");
const router = express.Router();
const dbConfig = require("../config/db");

// Fetch Current Energy Data using Stored Procedure
router.get("/energy-data", async (req, res) => {
  let pool;
  try {
    // Connect to the database
    pool = await sql.connect(dbConfig);

    // Corrected: Use pool.request() instead of sql.request()
    const result = await pool.request().execute("sp_GetDashboardData");

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]); // Send first row of data
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    // Close the connection only if it was established
    if (pool) {
      pool.close();
    }
  }
});

module.exports = router;
