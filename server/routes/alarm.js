const express = require("express");
const sql = require("mssql");
const router = express.Router();
const { getDbPool } = require("../db"); // ✅ Use centralized DB connection

// ✅ Fetch All Alarms with Formatted Duration
router.get("/", async (req, res) => {
  console.log("🔍 API hit: GET /api/alarm");
  try {
    const pool = await getDbPool();
    const result = await pool.request().query("SELECT id, description, FORMAT(activeAt, 'yyyy-MM-dd HH:mm') as activeAt, FORMAT(ackAt, 'yyyy-MM-dd HH:mm') as ackAt, FORMAT(timeOff, 'yyyy-MM-dd HH:mm') as timeOff, status, ackComment FROM Alarms ORDER BY activeAt DESC");

    // ✅ Format Duration (hh:mm:ss)
    const formattedData = result.recordset.map((alarm) => {
      const activeAt = new Date(alarm.activeAt);
      const endAt = alarm.timeOff ? new Date(alarm.timeOff) : new Date(); // Use current time if not cleared

      const durationMs = endAt - activeAt;
      const duration = formatDuration(durationMs);

      return { ...alarm, duration };
    });

    res.json(formattedData);
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ message: "Error fetching alarms", error });
  }
});

// ✅ Function to Format Duration as hh:mm:ss
const formatDuration = (ms) => {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// ✅ Acknowledge Alarm (with Comment)
router.put("/ack/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ackComment } = req.body; // ✅ Get comment from request body

    if (!ackComment || ackComment.trim() === "") {
      return res.status(400).json({ message: "Acknowledgement comment is required." });
    }

    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("ackComment", sql.NVarChar, ackComment)
      .query("UPDATE Alarms SET ackAt = GETDATE(), ackComment = @ackComment WHERE id = @id");

    res.json({ message: "Alarm Acknowledged with Comment" });
  } catch (error) {
    console.error("❌ Error updating alarm:", error);
    res.status(500).json({ message: "Error updating alarm", error });
  }
});

// ✅ Acknowledge Multiple Alarms (Bulk Acknowledge)
router.put("/ack-all", async (req, res) => {
  try {
    const { alarmIds, ackComment } = req.body; // Get IDs and comment

    if (!ackComment || ackComment.trim() === "") {
      return res.status(400).json({ message: "Acknowledgement comment is required." });
    }

    if (!alarmIds || alarmIds.length === 0) {
      return res.status(400).json({ message: "No active alarms to acknowledge." });
    }

    const pool = await getDbPool();

    // ✅ Update multiple alarms in one query
    await pool
      .request()
      .input("ackComment", sql.NVarChar, ackComment)
      .query(
        `UPDATE Alarms SET ackAt = GETDATE(), ackComment = @ackComment WHERE id IN (${alarmIds.join(",")})`
      );

    res.json({ message: "All active alarms acknowledged." });
  } catch (error) {
    console.error("❌ Error acknowledging multiple alarms:", error);
    res.status(500).json({ message: "Error acknowledging alarms", error });
  }
});

// ✅ Clear Alarm
// alarmRoutes.js or wherever your routes are defined

router.put("/clear/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("UPDATE Alarms SET timeOff = GETDATE(), status = 'OFF' WHERE id = @id");

    res.json({ message: "Alarm Cleared" });
  } catch (error) {
    console.error("Error clearing alarm:", error);
    res.status(500).json({ message: "Error clearing alarm", error });
  }
});

// ✅ Only Active Alarm
router.get("/Active-alarm", async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query("SELECT * FROM Alarms WHERE status = 'ON' ORDER BY activeAt DESC");
    res.json(result.recordset);
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ message: "Error fetching alarms", error });
  }
});

module.exports = router; // ✅ Ensure it's exported properly
