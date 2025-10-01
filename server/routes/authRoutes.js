const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, getDbPool } = require("../db");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// 🔐 Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    console.log("🔍 Checking user:", username);
    const pool = await getDbPool();
    if (!pool) {
      console.error("❌ Database connection failed");
      return res.status(500).json({ message: "Database connection error" });
    }

    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT id, username, password, designation FROM Users WHERE username = @username");

    const user = result.recordset[0];
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.designation },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response with token and user details
    res.json({
      token,
      username: user.username,
      role: user.designation,
    });
  } catch (error) {
    console.error("❌ Login Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
