const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, getDbPool } = require("../db"); // ✅ Correct Import
const dotenv = require("dotenv");

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// 🔹 Login Route
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("🔍 Checking user:", username);

        // ✅ Get the DB connection from the pool
        const pool = await getDbPool();  // ✅ Correct way to get the DB pool
        if (!pool) {
            return res.status(500).json({ message: "Database connection error" });
        }

        const result = await pool
            .request()
            .input("username", sql.VarChar, username) // ✅ Parameterized query
            .query("SELECT * FROM Users WHERE username = @username");

        console.log("🔍 SQL Result:", result.recordset);

        const user = result.recordset[0];

        if (!user) {
            console.log("❌ User not found");
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("🔍 Stored Password:", user.password);
        console.log("🔍 Entered Password:", password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔍 Password Match:", isMatch);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
