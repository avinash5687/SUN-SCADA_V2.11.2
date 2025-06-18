const express = require("express");
const sql = require("mssql");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { getDbPool } = require("../db"); // ✅ Use centralized database connection

// ✅ Establish Database Connection
const poolPromise = getDbPool();

// ✅ Fetch List of Tables
router.get("/getTables", async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='VIEW' AND TABLE_NAME <> 'BAC_PortRoot' AND TABLE_NAME <> 'DeletedObjects_View' AND TABLE_NAME <> 'IDSequences_View' AND TABLE_NAME <> 'INVERTER' AND TABLE_NAME <> 'INVERTER_TOP1' AND TABLE_NAME <> 'MFM' AND TABLE_NAME <> 'MFM_TOP1' AND TABLE_NAME <> 'NCU' AND TABLE_NAME <> 'SMB' AND TABLE_NAME <> 'SPC' AND TABLE_NAME <> 'TableIDs_View' AND TABLE_NAME <> 'TRAFO' AND TABLE_NAME <> 'TRAFO_TOP1' AND TABLE_NAME <> 'UNIT' AND TABLE_NAME <> 'TRAFO1' AND TABLE_NAME <> 'TRAFO2' ORDER BY TABLE_NAME");
    res.json(result.recordset.map(row => row.TABLE_NAME));
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ error: "Failed to fetch tables" });
  }
});

// ✅ Fetch Columns of a Table
router.get("/getColumns/:tableName", async (req, res) => {
  try {
    const tableName = req.params.tableName;
    if (!tableName) return res.status(400).json({ error: "Table name is required" });

    const pool = await getDbPool();
    const result = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}' AND COLUMN_NAME <> 'Sr_No' AND COLUMN_NAME <> 'Sr.No.' AND COLUMN_NAME <> 'Date_Time' AND COLUMN_NAME <> 'ICR' ORDER BY COLLATION_NAME`);
    res.json(result.recordset.map(row => row.COLUMN_NAME));
  } catch (error) {
    console.error(`❌ Error fetching columns for ${tableName}:`, error);
    res.status(500).json({ error: `Failed to fetch columns for ${tableName}` });
  }
});

// ✅ Fetch Data for Trend Graph
router.post("/getTableData", async (req, res) => {
  console.log("📌 Full Request Body Received:", JSON.stringify(req.body, null, 2));

  const { table1, columns1, table2, columns2, startDate, endDate } = req.body;
  if (!table1 || !columns1.length || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    let query = `SELECT t1.Date_Time, ${columns1.map(c => `t1.${c}`).join(", ")}`;

    if (table2 && columns2.length > 0) {
      query += `, ${columns2.map(c => `t2.${c}`).join(", ")}`;
      query += ` FROM ${table1} AS t1 LEFT JOIN ${table2} AS t2 ON convert(varchar(16),t1.Date_Time,120) = convert(varchar(16),t2.Date_Time,120)`;
    } else {
      query += ` FROM ${table1} AS t1`;
    }

    query += ` WHERE t1.Date_Time BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59' ORDER BY t1.Date_Time ASC`;

    console.log("📌 Executing SQL Query:", query);
    const pool = await getDbPool();
    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Database Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Export CSV Data
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
      query += ` LEFT JOIN ${table2} AS t2 ON convert(varchar(16),t1.Date_Time,120) = convert(varchar(16),t2.Date_Time,120)`;
    }

    query += ` WHERE t1.Date_Time BETWEEN '${startDate} 00:00:00' AND '${endDate} 23:59:59' ORDER BY t1.Date_Time ASC`;

    const pool = await getDbPool();
    const result = await pool.request().query(query);

    if (!result.recordset.length) {
      return res.status(404).json({ error: "No data found for the selected criteria." });
    }

    // Convert JSON to CSV
    const csv = jsonToCsv(result.recordset);

    // Define file path
    const fileName = `Data_${table1}_and_${table2}_${startDate}_to_${endDate}.csv`;
    const filePath = path.join(__dirname, "exports", fileName);

    // Ensure the 'exports' folder exists
    if (!fs.existsSync(path.join(__dirname, "exports"))) {
      fs.mkdirSync(path.join(__dirname, "exports"));
    }

    // Save CSV file to server
    fs.writeFileSync(filePath, csv);

    console.log(`✅ CSV file saved at: ${filePath}`);

    // Send file for download
    res.download(filePath);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Helper function to convert JSON to CSV
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
