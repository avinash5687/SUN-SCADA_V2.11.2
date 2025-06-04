const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { getDbPool } = require("./db"); // ✅ Use db.js for MSSQL Connection
const sql = require("mssql");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ensure DB Connection Before Starting Server
getDbPool()
  .then(() => {
    console.log("✅ MSSQL Connection Established");

    // ✅ Import and Use Routes
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/data", require("./routes/dataRoutes"));
    app.use("/api/inverter", require("./routes/inverter"));
    app.use("/api/mfm", require("./routes/mfm"));
    app.use("/api/wms", require("./routes/wms"));
    app.use("/api/dashboard", require("./routes/dashboard"));
    app.use("/api/alarm", require("./routes/alarm"));
    app.use("/api/custom-trend", require("./routes/customTrend"));
    app.use("/api/transformer", require("./routes/transformer"));



    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to Connect to Database. Exiting...", error);
    process.exit(1);
  });
