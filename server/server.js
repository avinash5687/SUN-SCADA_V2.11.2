const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { getDbPool } = require("./db");
const sql = require("mssql");
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ UPDATED: Single CORS configuration allowing both HTTP and HTTPS for production domains
app.use(cors({ 
  origin: [
    "http://localhost:3000",             // For local development
    "http://103.102.234.177:3000",       // Production IP (HTTP)
    "https://103.102.234.177:3000",      // Production IP (HTTPS)
    "http://sun-scada.com:3000",         // Production Domain (HTTP)
    "https://sun-scada.com",             // NEW: Production Domain (HTTPS, standard port)
    "https://sun-scada.com:3000"         // NEW: Production Domain (HTTPS, port 3000)
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Ensure DB Connection Before Starting Server
getDbPool()
  .then((pool) => {
    console.log("✅ MSSQL Connection Established");
    
    // Attach pool to app locals
    app.locals.db = pool;

    // ✅ Route imports
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/data", require("./routes/dataRoutes"));
    app.use("/api/inverter", require("./routes/inverter"));
    app.use("/api/mfm", require("./routes/mfm"));
    app.use("/api/wms", require("./routes/wms"));
    app.use("/api/dashboard", require("./routes/dashboard"));
    app.use("/api/alarm", require("./routes/alarm"));
    app.use("/api/custom-trend", require("./routes/customTrend"));
    app.use("/api/transformer", require("./routes/transformer"));

    // ✅ Add server startup error handling
    const server = app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use`);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to Connect to Database. Exiting...", error);
    process.exit(1);
  });
