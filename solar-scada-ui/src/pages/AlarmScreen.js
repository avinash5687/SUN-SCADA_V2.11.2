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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Custom Date Input Component with Calendar Icon
const CustomDateInput = React.forwardRef(({ value, onClick, onChange }, ref) => (
  <div className="custom-date-input-alarm" onClick={onClick}>
    <input
      type="text"
      value={value || ""}
      onChange={onChange}
      placeholder="YYYY-MM-DD"
      className="date-input-field-alarm"
      ref={ref}
      onFocus={(e) => e.target.select()}
    />
    <svg
      className="calendar-icon-inline-alarm"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3498db"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  </div>
));

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
  // Date filters
  const [activeStartDate, setActiveStartDate] = useState("");
  const [activeEndDate, setActiveEndDate] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterFrom, setFilterFrom] = useState(null);
  const [filterTo, setFilterTo] = useState(null);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);

  const fetchAlarms = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.alarm.getAll);
      setAlarms(response.data);
      dataRef.current = response.data;
      setError(null);
    } catch (e) {
      console.error("Failed to fetch alarms:", e);
      setError("Failed to fetch alarms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for both ACTIVE and HISTORY tabs
  const applyDateFilter = (start, end, tab) => {
    if (!start || !end) {
      alert('Please select both start and end dates.');
      return;
    }

    // Defensive: ensure start <= end
    if (start > end) {
      alert('From date cannot be after To date.');
      return;
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    // Filter alarms by date range
    const filtered = dataRef.current.filter(a => {
      // Parse activeAt which is in "YYYY-MM-DD HH:mm" format
      const alarmDate = new Date(a.activeAt.replace(' ', 'T'));
      return alarmDate >= startDate && alarmDate <= endDate;
    });

    setAlarms(filtered);
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
      const res = await axios.put(API_ENDPOINTS.alarm.acknowledge(selectedAlarmId), { ackComment: comment });
      // If server returned updated alarm, update local state immediately
      if (res.data && res.data.alarm) {
        const updatedAlarm = res.data.alarm;
        setAlarms(prev => {
          const next = prev.map(a => a.id === updatedAlarm.id ? { ...a, ...updatedAlarm } : a);
          dataRef.current = next;
          return next;
        });
      } else {
        // Fallback: refresh from server
        fetchAlarms(false);
      }
      closePopup();
    } catch (error) {
      console.error("Acknowledge alarm error:", error);
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
      const res = await axios.put(API_ENDPOINTS.alarm.acknowledgeAll, { alarmIds, ackComment: comment });
      // Optimistically update local state for immediate UI feedback
      if (res.data && res.data.acknowledgedIds) {
        const ids = res.data.acknowledgedIds;
        const now = new Date();
        const formattedNow = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        setAlarms(prev => {
          const next = prev.map(a => ids.includes(a.id) ? { ...a, ackAt: formattedNow, ackComment: comment } : a);
          dataRef.current = next;
          return next;
        });
      } else {
        fetchAlarms(false);
      }
      closePopup();
    } catch (error) {
      console.error("Acknowledge all alarms error:", error);
      alert("Could not acknowledge all alarms. Try again.");
    }
  };

  const clearAlarm = async (id) => {
    // Pre-check ackComment to avoid unnecessary server call
    const alarm = alarms.find(a => a.id === id) || dataRef.current.find(a => a.id === id);
    const ackComment = alarm?.ackComment || alarm?.ackcomment;
    if (!ackComment || ackComment.trim() === "") {
      alert("Alarm must be acknowledged with a comment before clearing.");
      return;
    }
    try {
      const res = await axios.put(API_ENDPOINTS.alarm.clear(id));
      if (res.data && res.data.alarm) {
        const updated = res.data.alarm;
        setAlarms(prev => {
          const next = prev.map(a => a.id === updated.id ? { ...a, ...updated } : a);
          dataRef.current = next;
          return next;
        });
      } else {
        setAlarms(prevAlarms => prevAlarms.map(alarm =>
          alarm.id === id ? { ...alarm, status: 'OFF', timeOff: new Date().toISOString() } : alarm
        ));
      }
    } catch (error) {
      console.error("Clear alarm error:", error);
      alert("Failed to clear the alarm. Please try again.");
    }
  };

  const clearAllActiveAlarms = async () => {
    const activeAlarms = dataRef.current.filter((alarm) => alarm.status === "ON");
    if (activeAlarms.length === 0) {
      alert("No active alarms to clear.");
      return;
    }

    // Separate alarms that have ack comments and those that don't
    const withAck = activeAlarms.filter(a => (a.ackComment || a.ackcomment) && (a.ackComment || a.ackcomment).toString().trim() !== "");
    const withoutAck = activeAlarms.filter(a => !((a.ackComment || a.ackcomment) && (a.ackComment || a.ackcomment).toString().trim() !== ""));

    if (withAck.length === 0) {
      alert("No active alarms have acknowledgement comments. Please acknowledge alarms before clearing.");
      return;
    }

    if (withoutAck.length > 0) {
      const proceed = window.confirm(`${withoutAck.length} active alarm(s) do not have acknowledgement comments and will NOT be cleared. Proceed to clear ${withAck.length} alarm(s) that are acknowledged?`);
      if (!proceed) return;
    }

    try {
      // Clear acknowledged alarms in parallel
      const clearPromises = withAck.map(alarm =>
        axios.put(API_ENDPOINTS.alarm.clear(alarm.id)).then(res => ({ ok: true, alarm: res.data?.alarm || null })).catch(err => ({ ok: false, id: alarm.id, error: err }))
      );

      const results = await Promise.all(clearPromises);

      // Apply updates returned from server immediately
      setAlarms(prev => {
        const next = prev.map(a => {
          const r = results.find(rr => rr.ok && rr.alarm && rr.alarm.id === a.id);
          return r && r.alarm ? { ...a, ...r.alarm } : a;
        });
        dataRef.current = next;
        return next;
      });

      // For any failures, show a message
      const failures = results.filter(r => !r.ok);
      if (failures.length > 0) {
        console.warn('Some clears failed:', failures);
        alert(`${failures.length} alarm(s) could not be cleared. Check logs.`);
      }
    } catch (error) {
      console.error('Failed to clear all acknowledged alarms:', error);
      alert("Failed to clear all alarms. Please try again.");
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const isFilterApplied = !!(activeTab === 'ACTIVE' ? (activeStartDate || activeEndDate) : (historyStartDate || historyEndDate));

  useEffect(() => {
    fetchAlarms(true);
    const interval = setInterval(() => fetchAlarms(false), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="alarm-container">
      {/* Header */}
      <div className="alarm-header">
        <h2 className="alarm-title">Alarm Management</h2>
        <div className="alarm-controls">
            <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                {loading && (
                  <div className="loading-indicator">
                    <div className="loading-spinner"></div>
                    <span>Loading...</span>
                  </div>
                )}
                <button className="action-btn" onClick={() => {
                  if (isFilterApplied) {
                    // Clear current tab filters and reload all data
                    if (activeTab === 'ACTIVE') {
                      setActiveStartDate(""); 
                      setActiveEndDate("");
                    } else {
                      setHistoryStartDate(""); 
                      setHistoryEndDate("");
                    }
                    fetchAlarms(false);
                  } else {
                    // open filter popup and seed current values
                    setFilterFrom(activeTab === 'ACTIVE' ? activeStartDate : historyStartDate);
                    setFilterTo(activeTab === 'ACTIVE' ? activeEndDate : historyEndDate);
                    setShowFilterPopup(true);
                  }
                }} style={{padding:'6px 10px'}}>
                  {isFilterApplied ? 'Clear Filter' : 'Filter'}
                </button>
              </div>
            </div>

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
            <div className={`alarm-table-wrapper ${activeTab === 'HISTORY' ? 'history' : ''}`}>
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

      {/* Filter Popup */}
      {showFilterPopup && (
        <Fade in={showFilterPopup} timeout={200}>
          <div className="alarm-popup-overlay">
            <div className="alarm-popup">
              <div className="popup-header">
                <h3>
                  <FontAwesomeIcon icon={faHistory} />
                  Filter Alarms by Date
                </h3>
              </div>
              <div className="popup-content">
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <div style={{display:'flex',flexDirection:'column'}}>
                    <label style={{fontSize:12,color:'#6c757d'}}>From</label>
                    <div className="date-picker-container-alarm">
                      <DatePicker
                        selected={filterFrom}
                        onChange={(date) => setFilterFrom(date)}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomDateInput />}
                        calendarClassName="custom-calendar-alarm"
                        portalId="root"
                        withPortal
                        placeholderText="yyyy-mm-dd"
                      />
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column'}}>
                    <label style={{fontSize:12,color:'#6c757d'}}>To</label>
                    <div className="date-picker-container-alarm">
                      <DatePicker
                        selected={filterTo}
                        onChange={(date) => setFilterTo(date)}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomDateInput />}
                        calendarClassName="custom-calendar-alarm"
                        portalId="root"
                        withPortal
                        placeholderText="yyyy-mm-dd"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="popup-actions">
                <button className="popup-btn confirm-btn" onClick={() => {
                  if (!filterFrom || !filterTo) {
                    alert('Please select both From and To dates.');
                    return;
                  }
                  
                  // Apply filter for both tabs using client-side filtering
                  if (activeTab === 'ACTIVE') {
                    setActiveStartDate(filterFrom.toISOString().split('T')[0]);
                    setActiveEndDate(filterTo.toISOString().split('T')[0]);
                  } else {
                    setHistoryStartDate(filterFrom.toISOString().split('T')[0]);
                    setHistoryEndDate(filterTo.toISOString().split('T')[0]);
                  }
                  
                  // Apply the date filter
                  applyDateFilter(filterFrom, filterTo, activeTab);
                  setShowFilterPopup(false);
                }}>
                  Apply
                </button>
                <button className="popup-btn cancel-btn" onClick={() => setShowFilterPopup(false)}>
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