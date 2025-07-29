const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// ✅ Load environment variables first, specifying the path to your .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const { getDbPool } = require("./db");

const app = express();
const HTTPS_PORT = process.env.HTTPS_PORT || 8443; // Use a non-privileged port for development
const HTTP_PORT = process.env.HTTP_PORT || 5000;   // Default to 5000 for local development

// --- Middleware ---
// A more secure CORS configuration.
// This allows requests from your local dev environment and your production domain over HTTPS.
app.use(cors({ 
  origin: [
    "https://localhost:3000",      // For local React development server
    "https://sun-scada.com",      // Your production domain
    "https://www.sun-scada.com",   // Optional: if you use the 'www' subdomain
    "https://103.102.234.177",    // Your server's public IP (HTTPS)
    "http://103.102.234.177"      // Your server's public IP (HTTP)
  ], 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Serve React App ---
// This serves your production-built React app.
const uiBuildPath = path.join(__dirname, '..', 'solar-scada-ui', 'build');
app.use(express.static(uiBuildPath));

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

    // --- API Routes ---
    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/data", require("./routes/dataRoutes"));
    app.use("/api/inverter", require("./routes/inverter"));
    app.use("/api/mfm", require("./routes/mfm"));
    app.use("/api/wms", require("./routes/wms"));
    app.use("/api/dashboard", require("./routes/dashboard"));
    app.use("/api/alarm", require("./routes/alarm"));
    app.use("/api/custom-trend", require("./routes/customTrend"));
    app.use("/api/transformer", require("./routes/transformer"));

    // --- React Catch-all Route ---
    // This must be AFTER your API routes. It serves the index.html for any
    // request that doesn't match an API route, enabling client-side routing.
    app.get('*', (req, res) => {
      res.sendFile(path.join(uiBuildPath, 'index.html'));
    });

    // --- Server Startup Logic ---
    if (process.env.NODE_ENV === 'production') {
      // --- Production: Start HTTPS Server ---
      try {
        const certsDir = path.resolve(__dirname, 'SSL_certificate');
        const privateKey = fs.readFileSync(path.join(certsDir, 'private.key'), 'utf8');
        const certificate = fs.readFileSync(path.join(certsDir, 'certificate.crt'), 'utf8');
        const caBundle = fs.readFileSync(path.join(certsDir, 'ca_bundle.crt'), 'utf8');
        const credentials = { key: privateKey, cert: certificate, ca: caBundle };

        const httpsServer = https.createServer(credentials, app);
        httpsServer.listen(HTTPS_PORT, () => {
          console.log(`🚀 HTTPS Server running on port ${HTTPS_PORT}`);
        });
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.error('❌ SSL Certificate Error: Could not find certificate files for production.');
          console.error(`   Searched in: ${error.path}`);
        } else {
          console.error('❌ Failed to start HTTPS server:', error);
        }
        process.exit(1);
      }
    } else {
      // --- Development: Start HTTP Server ---
      http.createServer(app).listen(HTTP_PORT, () => {
        console.log(`🚀 HTTP Development Server running on port ${HTTP_PORT}`);
        console.log(`   UI proxy is set to "http://localhost:${HTTP_PORT}"`);
      });
    }

  })
  .catch((error) => {
    console.error("❌ Failed to Connect to Database. Exiting...", error);
    process.exit(1);
  });
