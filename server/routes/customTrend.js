const express = require("express");
const sql = require("mssql");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { getDbPool } = require("../db");

// ✅ Redis Cache Helper
const { getOrSetCache, handleError } = require("../helpers/cacheHelper");

// ✅ Establish Database Connection
const poolPromise = getDbPool();

/* ----------------------- 1. Fetch List of Tables ----------------------- */
router.get("/getTables", async (req, res) => {
  try {
    const cacheKey = "customTrend:getTables";

    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await getDbPool();
      const result = await pool.request().query(`
        SELECT * FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE='VIEW'
        AND TABLE_NAME NOT IN (
          'BAC_PortRoot','DeletedObjects_View','IDSequences_View','INVERTER',
          'INVERTER_TOP1','MFM','MFM_TOP1','NCU','SMB','SPC','TableIDs_View',
          'TRAFO','TRAFO_TOP1','UNIT','TRAFO1','TRAFO2'
        )
        ORDER BY TABLE_NAME
      `);
      return result.recordset.map(row => row.TABLE_NAME);
    }, 600); // Cache for 10 minutes

    res.json(data);
  } catch (error) {
    handleError(res, error, "Fetching Tables");
  }
});

/* ----------------------- 2. Fetch Columns of a Table ----------------------- */
router.get("/getColumns/:tableName", async (req, res) => {
  try {
    const tableName = req.params.tableName;
    if (!tableName) return res.status(400).json({ error: "Table name is required" });

    const cacheKey = `customTrend:getColumns:${tableName}`;

    const data = await getOrSetCache(cacheKey, async () => {
      const pool = await getDbPool();
      const result = await pool.request().query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '${tableName}'
        AND COLUMN_NAME NOT IN ('Sr_No','Sr.No.','Date_Time','ICR')
        ORDER BY COLLATION_NAME
      `);
      return result.recordset.map(row => row.COLUMN_NAME);
    }, 600); // Cache for 10 minutes

    res.json(data);
  } catch (error) {
    handleError(res, error, `Fetching columns for ${req.params.tableName}`);
  }
});

/* ----------------------- 3. Fetch Data for Trend Graph ----------------------- */
router.post("/getTableData", async (req, res) => {
  console.log("📌 Full Request Body Received:", JSON.stringify(req.body, null, 2));

  const { table1, columns1, table2, columns2, startDate, endDate } = req.body;
  if (!table1 || !columns1.length || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const cacheKey = `customTrend:getTableData:${table1}:${table2 || "none"}:${startDate}:${endDate}:${columns1.join(",")}:${columns2 ? columns2.join(",") : ""}`;

    const data = await getOrSetCache(cacheKey, async () => {
      let query = `SELECT t1.Date_Time, ${columns1.map(c => `t1.${c}`).join(", ")}`;

      if (table2 && columns2.length > 0) {
        query += `, ${columns2.map(c => `t2.${c}`).join(", ")}`;
        query += ` FROM ${table1} AS t1 
                   LEFT JOIN ${table2} AS t2 
                   ON CONVERT(VARCHAR(16), t1.Date_Time, 120) = CONVERT(VARCHAR(16), t2.Date_Time, 120)`;
      } else {
        query += ` FROM ${table1} AS t1`;
      }

      query += ` WHERE t1.Date_Time BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'
                 ORDER BY t1.Date_Time ASC`;

      console.log("📌 Executing SQL Query:", query);
      const pool = await getDbPool();
      const result = await pool.request().query(query);
      return result.recordset;
    }, 300); // Cache for 5 minutes (for time-range queries)

    res.json(data);
  } catch (err) {
    handleError(res, err, "Fetching Trend Data");
  }
});

/* ----------------------- 4. Export CSV Data (No Cache) ----------------------- */
router.post("/exportCSV", async (req, res) => {
  try {
    const { table1, columns1, table2, columns2, startDate, endDate } = req.body;

    if (!table1 || !columns1.length || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    let query = `SELECT t1.Date_Time, ${columns1.map(c => `t1.${c}`).join(", ")}`;

    if (table2 && columns2.length > 0) {
      query += `, ${columns2.map(c => `t2.${c}`).join(", ")}`;
    }

    query += ` FROM ${table1} AS t1`;

    if (table2 && columns2.length > 0) {
      query += ` LEFT JOIN ${table2} AS t2 
                 ON CONVERT(VARCHAR(16), t1.Date_Time, 120) = CONVERT(VARCHAR(16), t2.Date_Time, 120)`;
    }

    query += ` WHERE t1.Date_Time BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59'
               ORDER BY t1.Date_Time ASC`;

    const pool = await getDbPool();
    const result = await pool.request().query(query);

    if (!result.recordset.length) {
      return res.status(404).json({ error: "No data found for the selected criteria." });
    }

    // Convert JSON to CSV
    const csv = jsonToCsv(result.recordset);

    // Define file path
    const fileName = `Data_${table1}_and_${table2 || "NA"}_${startDate}_to_${endDate}.csv`;
    const exportDir = path.join(__dirname, "exports");

    // Ensure folder exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    const filePath = path.join(exportDir, fileName);
    fs.writeFileSync(filePath, csv);

    console.log(`✅ CSV file saved at: ${filePath}`);

    res.download(filePath);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ----------------------- Helper: JSON → CSV ----------------------- */
const jsonToCsv = (jsonData) => {
  if (!jsonData || jsonData.length === 0) return "";

  const header = Object.keys(jsonData[0]).join(",") + "\n";
  const rows = jsonData.map(row =>
    Object.values(row).map(value =>
      value instanceof Date ? value.toISOString().replace("T", " ").split(".")[0] : value
    ).join(",")
  ).join("\n");

  return header + rows;
};

module.exports = router;
