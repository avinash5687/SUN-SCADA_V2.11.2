const express = require("express");
const sql = require("mssql");
const router = express.Router();
const { getDbPool } = require("../db");

const {
  getOrSetCache,
  setNoCacheHeaders,
  handleError,
} = require("../helpers/cacheHelper");

const redisClient = require("../config/redisClient");

// Helper: format duration as hh:mm:ss
function formatDuration(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

// Helper: invalidate cache after DB updates
async function invalidateAlarmCache() {
  await redisClient.del("alarms_all");
  await redisClient.del("alarms_active");
  console.log("♻️ Alarm cache invalidated");
}

// ----------------------------
// Fetch All Alarms (Cached)
// ----------------------------
router.get("/", async (req, res) => {
  console.log("🔍 API hit: GET /api/alarm");
  setNoCacheHeaders(res);

  try {
    const alarms = await getOrSetCache("alarms_all", async () => {
      const pool = await getDbPool();
      const result = await pool.request().query(`
        SELECT id, description,
               FORMAT(activeAt, 'yyyy-MM-dd HH:mm') as activeAt,
               FORMAT(ackAt, 'yyyy-MM-dd HH:mm') as ackAt,
               FORMAT(timeOff, 'yyyy-MM-dd HH:mm') as timeOff,
               status, ackComment
        FROM Alarms
        ORDER BY activeAt DESC
      `);

      // Add duration field
      return result.recordset.map((alarm) => {
        const activeAt = new Date(alarm.activeAt);
        const endAt = alarm.timeOff ? new Date(alarm.timeOff) : new Date();
        const duration = formatDuration(endAt - activeAt);
        return { ...alarm, duration };
      });
    });

    res.json(alarms);
  } catch (err) {
    handleError(res, err, "fetching alarms");
  }
});

// ----------------------------
// Fetch Only Active Alarms (Cached)
// ----------------------------
router.get("/Active-alarm", async (req, res) => {
  console.log("🔍 API hit: GET /api/alarm/Active-alarm");
  setNoCacheHeaders(res);

  try {
    const activeAlarms = await getOrSetCache("alarms_active", async () => {
      const pool = await getDbPool();
      const result = await pool
        .request()
        .query("SELECT * FROM Alarms WHERE status = 'ON' ORDER BY activeAt DESC");
      return result.recordset;
    });

    res.json(activeAlarms);
  } catch (err) {
    handleError(res, err, "fetching active alarms");
  }
});

// ----------------------------
// Acknowledge Alarm
// ----------------------------
router.put("/ack/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ackComment } = req.body;

    if (!ackComment || ackComment.trim() === "") {
      return res
        .status(400)
        .json({ message: "Acknowledgement comment is required." });
    }

    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("ackComment", sql.NVarChar, ackComment)
      .query(
        "UPDATE Alarms SET ackAt = GETDATE(), ackComment = @ackComment WHERE id = @id"
      );

    await invalidateAlarmCache();

    res.json({ message: "Alarm Acknowledged with Comment" });
  } catch (err) {
    handleError(res, err, "acknowledging alarm");
  }
});

// ----------------------------
// Acknowledge Multiple Alarms
// ----------------------------
router.put("/ack-all", async (req, res) => {
  try {
    const { alarmIds, ackComment } = req.body;

    if (!ackComment || ackComment.trim() === "") {
      return res
        .status(400)
        .json({ message: "Acknowledgement comment is required." });
    }

    if (!alarmIds || alarmIds.length === 0) {
      return res.status(400).json({ message: "No active alarms to acknowledge." });
    }

    const pool = await getDbPool();
    await pool
      .request()
      .input("ackComment", sql.NVarChar, ackComment)
      .query(
        `UPDATE Alarms SET ackAt = GETDATE(), ackComment = @ackComment WHERE id IN (${alarmIds.join(
          ","
        )})`
      );

    await invalidateAlarmCache();

    res.json({ message: "All active alarms acknowledged." });
  } catch (err) {
    handleError(res, err, "bulk acknowledging alarms");
  }
});

// ----------------------------
// Clear Alarm
// ----------------------------
router.put("/clear/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getDbPool();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        "UPDATE Alarms SET timeOff = GETDATE(), status = 'OFF' WHERE id = @id"
      );

    await invalidateAlarmCache();

    res.json({ message: "Alarm Cleared" });
  } catch (err) {
    handleError(res, err, "clearing alarm");
  }
});

module.exports = router;
