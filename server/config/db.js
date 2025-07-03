const dotenv = require("dotenv");
const os = require("os");

dotenv.config();

// ✅ Automatically detect if environment is local
const isLocal =
  process.env.HOST?.includes("localhost") ||
  process.env.HOST?.includes("127.0.0.1") ||
  os.hostname().toLowerCase().includes("desktop") ||
  os.hostname().toLowerCase().includes("lap") ||
  process.env.NODE_ENV === "development";

// ✅ Use correct DB_SERVER value
const dbServer = isLocal ? "localhost" : "103.102.234.177";

// Final config
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: dbServer,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

module.exports = dbConfig;
