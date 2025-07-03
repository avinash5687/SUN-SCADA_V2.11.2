const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, getDbPool } = require("../db");
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// 🔐 Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("🔍 Checking user:", username);

    const pool = await getDbPool();
    if (!pool) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM Users WHERE username = @username");

    const user = result.recordset[0];

    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token with role also inside if you want to decode it later
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.designation },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🆕 Send role in response
    res.json({
      token,
      username: user.username,
      role: user.designation // 👈 sending designation as role
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
