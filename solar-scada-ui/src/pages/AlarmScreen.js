import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AlarmScreen.css";

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000";

// ✅ KPI Config
const plantKPIList = [
  { label: "Export", key: "P_EXP", unit: "kWh" },
  { label: "Import", key: "P_IMP", unit: "kWh" },
  { label: "PR", key: "PR", unit: "%" },
  { label: "POA", key: "POA", unit: "kWh/m²" },
  { label: "CUF", key: "CUF", unit: "%" },
  { label: "PA", key: "PA", unit: "%" },
  { label: "GA", key: "GA", unit: "%" },
];

const AlarmScreen = () => {
  const [alarms, setAlarms] = useState([]);
  const [comment, setComment] = useState("");
  const [selectedAlarmId, setSelectedAlarmId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isBulkAcknowledge, setIsBulkAcknowledge] = useState(false);
  const [plantKPI, setPlantKPI] = useState({});

  // ✅ Fetch alarms
  const fetchAlarms = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setAlarms(response.data);
    } catch (error) {
      console.error("❌ Error fetching alarms:", error);
    }
  };

  // ✅ Fetch KPI
  const fetchKPI = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/plant-kpi?_=${Date.now()}`);
      setPlantKPI(Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : {});
    } catch (error) {
      console.error("❌ Error fetching KPI:", error);
    }
  };

  useEffect(() => {
    fetchAlarms();
    fetchKPI();
    const interval = setInterval(() => {
      fetchAlarms();
      fetchKPI();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const openAckPopup = (id = null, isBulk = false) => {
    setSelectedAlarmId(id);
    setIsBulkAcknowledge(isBulk);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setComment("");
  };

  const acknowledgeAlarm = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment before acknowledging the alarm.");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/ack/${selectedAlarmId}`, { ackComment: comment });
      fetchAlarms();
      closePopup();
    } catch (error) {
      console.error(`❌ Error acknowledging alarm ID ${selectedAlarmId}:`, error);
    }
  };

  const acknowledgeAllActiveAlarms = async () => {
    const activeAlarms = alarms.filter((alarm) => alarm.status === "ON");
    const alarmIds = activeAlarms.map((alarm) => alarm.id);

    if (alarmIds.length === 0) {
      alert("No active alarms to acknowledge.");
      return;
    }

    if (!comment.trim()) {
      alert("Please enter a comment before acknowledging all alarms.");
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/ack-all`, { alarmIds, ackComment: comment });
      fetchAlarms();
      closePopup();
    } catch (error) {
      console.error("❌ Error acknowledging all alarms:", error);
    }
  };

  const clearAlarm = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/clear/${id}`);
      fetchAlarms();
    } catch (error) {
      console.error(`❌ Error clearing alarm ID ${id}:`, error);
    }
  };

  const clearAllActiveAlarms = async () => {
    const activeAlarms = alarms.filter((alarm) => alarm.status === "ON");
    for (const alarm of activeAlarms) {
      await axios.put(`${API_BASE_URL}/clear/${alarm.id}`);
    }
    fetchAlarms();
  };

  return (
    <div className="alarm-container">

      {/* ✅ PLANT KPI BAR */}
      <div className="plant-kpi-bar1">
        {plantKPIList.map(({ label, key, unit }) => (
          <div key={label} className="kpi-box1">
            <span className="kpi-label1">{label}</span>
            <span className="kpi-value1">
              {plantKPI[key] !== undefined && plantKPI[key] !== null
                ? `${parseFloat(plantKPI[key]).toFixed(2)} ${unit}`
                : "--"}
            </span>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="alarm-table">
          <thead>
            <tr>
              <th>Alarm Description</th>
              <th>Active At</th>
              <th>Acknowledged At</th>
              <th>Time OFF</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Acknowledgement Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {alarms.length > 0 ? (
              alarms.map((alarm) => (
                <tr key={alarm.id} className={alarm.status === "ON" ? "active-alarm" : ""}>
                  <td>{alarm.status === "ON" ? "🔔 " : ""}{alarm.description}</td>
                  <td>{alarm.activeAt}</td>
                  <td>{alarm.ackAt || "--"}</td>
                  <td>{alarm.timeOff || "--"}</td>
                  <td className="status">{alarm.status}</td>
                  <td>{alarm.duration || "--"}</td>
                  <td>{alarm.ackComment || "--"}</td>
                  <td>
                    {alarm.status === "ON" && (
                      <>
                        <button className="ack-button" onClick={() => openAckPopup(alarm.id)}>✔</button>
                        <button className="clear-button" onClick={() => clearAlarm(alarm.id)}>✖</button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="8">No alarms found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="button-container">
        <button onClick={() => openAckPopup(null, true)} className="ack-button">✔ Acknowledge All</button>
        <button onClick={clearAllActiveAlarms} className="clear-button">✖ Clear All</button>
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Enter Acknowledgement Comment</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment..."
            />
            <div className="popup-buttons">
              {isBulkAcknowledge ? (
                <button onClick={acknowledgeAllActiveAlarms} className="ack-button">✔ Confirm All</button>
              ) : (
                <button onClick={acknowledgeAlarm} className="ack-button">✔ Confirm</button>
              )}
              <button onClick={closePopup} className="clear-button">✖ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlarmScreen;
