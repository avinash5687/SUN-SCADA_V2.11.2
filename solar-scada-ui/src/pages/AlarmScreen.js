import React, { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import {
  Badge,
  Fade,
  Typography,
  Tooltip
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell, faHistory, faCheckCircle, faExclamationTriangle,
  faComment, faTimes, faCheck, faRotateRight
} from "@fortawesome/free-solid-svg-icons";
import "./AlarmScreen.css";
import { API_ENDPOINTS } from "../apiConfig";

const AlarmScreen = () => {
  const [alarms, setAlarms] = useState([]);
  const [comment, setComment] = useState("");
  const [selectedAlarmId, setSelectedAlarmId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isBulkAcknowledge, setIsBulkAcknowledge] = useState(false);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dataRef = useRef(alarms);

  const fetchAlarms = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.alarm.getAll);
      setAlarms(response.data);
      dataRef.current = response.data;
      setError(null);
    } catch (e) {
      setError("Failed to fetch alarms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAlarms = useMemo(() => {
    if (activeTab === 'ACTIVE') {
      return alarms.filter(alarm => alarm.status === 'ON');
    } else {
      return alarms.filter(alarm => alarm.status === 'OFF');
    }
  }, [alarms, activeTab]);

  const activeAlarmCount = useMemo(() => {
    return alarms.filter(alarm => alarm.status === 'ON').length;
  }, [alarms]);

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
      await axios.put(API_ENDPOINTS.alarm.acknowledge(selectedAlarmId), { ackComment: comment });
      fetchAlarms(false);
      closePopup();
    } catch (error) {
      alert("Could not acknowledge alarm. Try again.");
    }
  };

  const acknowledgeAllActiveAlarms = async () => {
    const activeAlarms = dataRef.current.filter((alarm) => alarm.status === "ON");
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
      await axios.put(API_ENDPOINTS.alarm.acknowledgeAll, { alarmIds, ackComment: comment });
      fetchAlarms(false);
      closePopup();
    } catch (error) {
      alert("Could not acknowledge all alarms. Try again.");
    }
  };

  const clearAlarm = async (id) => {
    try {
      await axios.put(API_ENDPOINTS.alarm.clear(id));
      fetchAlarms(false);
    } catch (error) {
      alert("Failed to clear the alarm. Please try again.");
    }
  };

  const clearAllActiveAlarms = async () => {
    const activeAlarms = dataRef.current.filter((alarm) => alarm.status === "ON");
    try {
      for (const alarm of activeAlarms) {
        await axios.put(API_ENDPOINTS.alarm.clear(alarm.id));
      }
      fetchAlarms(false);
    } catch (error) {
      alert("Failed to clear all alarms. Please try again.");
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    fetchAlarms(true);
    const interval = setInterval(() => fetchAlarms(false), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="alarm-container">
      {/* Header */}
      <div className="alarm-header">
        <h2 className="alarm-title">Alarm Management</h2>
        <div className="alarm-controls">
          <div className="alarm-tab-buttons">
            <button
              className={`alarm-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('ACTIVE')}
              disabled={loading}
            >
              <span className="tab-icon">
                <FontAwesomeIcon icon={faBell} />
              </span>
              ACTIVE
            </button>
            <button
              className={`alarm-tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('HISTORY')}
              disabled={loading}
            >
              <span className="tab-icon">
                <FontAwesomeIcon icon={faHistory} />
              </span>
              HISTORY
            </button>
          </div>
          
          <div className="alarm-data-info">
            <div className="active-tab-indicator">
              <span className={`tab-status ${activeTab.toLowerCase()}`}>
                ● {activeTab === 'ACTIVE' ? 'ACTIVE ALARMS' : 'ALARM HISTORY'}
              </span>
              <span className="alarm-count">
                {filteredAlarms.length} Alarm{filteredAlarms.length !== 1 ? 's' : ''}
              </span>
            </div>
            {loading && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="alarm-error-message">
          <div className="error-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <h3>Error</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => { setError(null); fetchAlarms(true); }}>
            <FontAwesomeIcon icon={faRotateRight} /> Try Again
          </button>
        </div>
      )}

      {/* Initial Loader */}
      {!error && loading && (
        <div className="no-alarms-message">
          <div className="loading-spinner large-loader"></div>
          <h3>Loading alarms...</h3>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        filteredAlarms.length === 0 ? (
          <div className="no-alarms-message">
            {activeTab === 'ACTIVE' ? (
              <>
                <div className="all-clear-icon">
                  <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <h3>All Clear!</h3>
                <p>No active alarms at the moment</p>
                <small>You'll be notified when new alarms are triggered</small>
              </>
            ) : (
              <>
                <div className="no-history-icon">
                  <FontAwesomeIcon icon={faHistory} />
                </div>
                <h3>No History</h3>
                <p>No alarm history available</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="alarm-table-wrapper">
              <table className="alarm-table">
                <thead>
                  <tr>
                    <th className="description-header">Alarm Description</th>
                    <th>Active At</th>
                    <th>Acknowledged At</th>
                    <th>Time OFF</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Comment</th>
                    {activeTab === 'ACTIVE' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAlarms.map((alarm) => (
                    <tr key={alarm.id} className={`alarm-row ${alarm.status === "ON" ? "active-alarm" : "history-alarm"}`}>
                      <td className="description-cell">
                        <div className="alarm-description">
                          {alarm.status === "ON" && (
                            <span className="alarm-indicator">
                              <FontAwesomeIcon icon={faBell} className="blinking-icon" />
                            </span>
                          )}
                          {alarm.description}
                        </div>
                      </td>
                      <td className="time-cell">{alarm.activeAt}</td>
                      <td className="time-cell">{alarm.ackAt || "--"}</td>
                      <td className="time-cell">{alarm.timeOff || "--"}</td>
                      <td>
                        <span className={`status-badge ${alarm.status === 'ON' ? 'status-active' : 'status-cleared'}`}>
                          {alarm.status}
                        </span>
                      </td>
                      <td className="duration-cell">{alarm.duration || "--"}</td>
                      <td className="comment-cell">{alarm.ackComment || "--"}</td>
                      {activeTab === 'ACTIVE' && (
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <Tooltip title="Acknowledge Alarm" placement="top">
                              <button
                                className="action-btn ack-btn"
                                onClick={() => openAckPopup(alarm.id)}
                              >
                                <FontAwesomeIcon icon={faCheck} />
                              </button>
                            </Tooltip>
                            <Tooltip title="Clear Alarm" placement="top">
                              <button
                                className="action-btn clear-btn"
                                onClick={() => clearAlarm(alarm.id)}
                              >
                                <FontAwesomeIcon icon={faTimes} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activeTab === 'ACTIVE' && activeAlarmCount > 0 && (
              <div className="bulk-actions">
                <button
                  onClick={() => openAckPopup(null, true)}
                  className="bulk-btn ack-all-btn"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Acknowledge All ({activeAlarmCount})
                </button>
                <button
                  onClick={clearAllActiveAlarms}
                  className="bulk-btn clear-all-btn"
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Clear All ({activeAlarmCount})
                </button>
              </div>
            )}
          </>
        )
      )}

      {/* Acknowledge Popup */}
      {showPopup && (
        <Fade in={showPopup} timeout={200}>
          <div className="alarm-popup-overlay">
            <div className="alarm-popup">
              <div className="popup-header">
                <h3>
                  <FontAwesomeIcon icon={faComment} />
                  Enter Acknowledgement Comment
                </h3>
              </div>
              <div className="popup-content">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter your acknowledgement comment..."
                  className="comment-textarea"
                />
              </div>
              <div className="popup-actions">
                {isBulkAcknowledge ? (
                  <button onClick={acknowledgeAllActiveAlarms} className="popup-btn confirm-btn">
                    <FontAwesomeIcon icon={faCheck} />
                    Confirm All
                  </button>
                ) : (
                  <button onClick={acknowledgeAlarm} className="popup-btn confirm-btn">
                    <FontAwesomeIcon icon={faCheck} />
                    Confirm
                  </button>
                )}
                <button onClick={closePopup} className="popup-btn cancel-btn">
                  <FontAwesomeIcon icon={faTimes} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Fade>
      )}
    </div>
  );
};

export default AlarmScreen;
