import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";
import "./ReportPage.css";

const ReportPage = () => {
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState("15");
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);
  
  // Section-specific errors
  const [reportTypeError, setReportTypeError] = useState("");
  const [deviceError, setDeviceError] = useState("");
  const [configError, setConfigError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [success, setSuccess] = useState("");

  const reportDeviceNameMap = {
    fn_report_inverter: "INVERTER",
    fn_report_mfm: "MFM",
    fn_report_smb: "SMB",
    fn_report_trafo: "TRAFO",
    fn_report_wms: "WMS",
    fn_report_dgr: "DGR",
    fn_report_alarms: "ALL",
  };

  const reportNameMap = {
    fn_report_inverter: "Inverter_Report",
    fn_report_mfm: "MFM_Report",
    fn_report_smb: "SMB_Report",
    fn_report_trafo: "Trafo_Report",
    fn_report_wms: "WMS_Report",
    fn_report_dgr: "DGR_Report",
    fn_report_alarms: "Alarms_Report",
  };

  const reportIcons = {
    fn_report_inverter: "🔌",
    fn_report_mfm: "📈",
    fn_report_smb: "💡",
    fn_report_trafo: "🔋",
    fn_report_wms: "☁️",
    fn_report_dgr: "📊",
    fn_report_alarms: "🔔",
  };

  const reportColors = {
    fn_report_inverter: "#3498db",
    fn_report_mfm: "#9b59b6",
    fn_report_smb: "#e67e22",
    fn_report_trafo: "#f39c12",
    fn_report_wms: "#1abc9c",
    fn_report_dgr: "#e74c3c",
    fn_report_alarms: "#c0392b",
  };

  const reportConfig = {
    fn_report_dgr: { needsDevices: false, needsFrequency: false, needsEndDate: false },
    fn_report_alarms: { needsDevices: true, needsFrequency: false, needsEndDate: true },
    default: { needsDevices: true, needsFrequency: true, needsEndDate: true }
  };

  const getReportConfig = (reportType) => {
    return reportConfig[reportType] || reportConfig.default;
  };

  // Clear all errors
  const clearAllErrors = () => {
    setReportTypeError("");
    setDeviceError("");
    setConfigError("");
    setDownloadError("");
  };

  // Fetch available report types
  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.report.list);
        setReportTypes(response.data);
        setReportTypeError(""); // Clear error on success
        console.log("✅ Report types loaded:", response.data);
      } catch (err) {
        console.error("❌ Failed to load report types:", err);
        setReportTypeError("Failed to load report types. Please refresh the page.");
      }
    };
    fetchReportTypes();
  }, []);

  // Fetch devices when report type changes
  useEffect(() => {
    const fetchDevices = async () => {
      setDeviceError(""); // Clear previous errors
      
      if (!selectedReport) {
        setDeviceList([]);
        return;
      }

      const config = getReportConfig(selectedReport);

      if (!config.needsDevices) {
        setDeviceList([]);
        setSelectedDeviceIds([]);
        return;
      }

      if (selectedReport === "fn_report_alarms") {
        try {
          const response = await axios.get(API_ENDPOINTS.report.devices, {
            params: { devicename: "ALARMS" },
          });

          const devices = response.data.map((d) => ({
            deviceid: d.name,
            name: d.name,
          }));

          console.log(`✅ Alarm devices loaded:`, devices);
          setDeviceList(devices);
          setSelectedDeviceIds([]);
          return;
        } catch (err) {
          console.error("❌ Failed to load alarm devices:", err);
          setDeviceError("Failed to load alarm devices. Please try again.");
          setDeviceList([]);
          return;
        }
      }

      const devicename = reportDeviceNameMap[selectedReport];
      if (!devicename) {
        console.warn("No device mapping found for:", selectedReport);
        return;
      }

      try {
        const response = await axios.get(API_ENDPOINTS.report.devices, {
          params: { devicename },
        });
        setDeviceList(response.data);
        setSelectedDeviceIds([]);
        console.log(`✅ Devices loaded for ${devicename}:`, response.data);
      } catch (err) {
        console.error("❌ Failed to load devices:", err);
        setDeviceList([]);
        setDeviceError(`Failed to load devices for ${devicename}. Please try selecting another report type.`);
      }
    };

    fetchDevices();
  }, [selectedReport]);

  const handleDeviceSelection = (deviceId) => {
    setSelectedDeviceIds(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  const selectAllDevices = () => {
    setSelectedDeviceIds(deviceList.map(d => d.deviceid.toString()));
  };

  const clearAllDevices = () => {
    setSelectedDeviceIds([]);
  };

  const downloadReport = async () => {
    const config = getReportConfig(selectedReport);
    
    // Clear all errors before validation
    clearAllErrors();
    
    // Validation
    if (!selectedReport) {
      setConfigError("Please select a report type");
      return;
    }

    if (!startDate) {
      setConfigError("Please select a start date");
      return;
    }

    if (config.needsEndDate && !endDate) {
      setConfigError("Please select an end date");
      return;
    }

    if (config.needsDevices && !selectedDeviceIds.length) {
      setDeviceError("Please select at least one device");
      return;
    }

    setLoading(true);
    setSuccess("");
    setDownloadError("");

    try {
      const params = {
        reportType: selectedReport,
        startDate,
        format,
      };

      if (config.needsEndDate) {
        params.endDate = endDate;
      }

      if (config.needsDevices) {
        const deviceIds = selectedDeviceIds.map((id) => parseInt(id, 10));
        params.deviceIds = JSON.stringify(deviceIds);
      }

      if (config.needsFrequency) {
        params.frequency = frequency;
      }

      console.log("📥 Downloading report with params:", params);

      const response = await axios.get(API_ENDPOINTS.report.run, { 
        params, 
        responseType: "blob" 
      });

      const mime = format === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "text/csv";
      const ext = format === "xlsx" ? "xlsx" : "csv";

      const reportName = reportNameMap[selectedReport] || "Report";
      const fileName = config.needsEndDate 
        ? `${reportName}_${startDate}_to_${endDate}.${ext}`
        : `${reportName}_${startDate}.${ext}`;

      const blob = new Blob([response.data], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess(`✅ ${fileName} downloaded successfully!`);
      setTimeout(() => setSuccess(""), 5000);
      
      console.log("✅ Report downloaded:", fileName);
    } catch (err) {
      console.error("❌ Download failed:", err);
      
      // Show download error in download section
      setDownloadError("Failed to download report. Please check your selections and try again.");
      setTimeout(() => setDownloadError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedReportData = () => {
    return reportTypes.find(r => r.funcName === selectedReport);
  };

  const calculateDateDifference = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const config = getReportConfig(selectedReport);

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <h2 className="report-title">Report Generator</h2>
        {loading && (
          <div className="report-loading-indicator">
            <div className="report-spinner"></div>
            <span>Generating...</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="report-content">
        {/* Global Success Message */}
        {success && (
          <div className="alert-message success">
            <span className="alert-icon">✅</span>
            <span className="alert-text">{success}</span>
          </div>
        )}

        {/* Report Grid */}
        <div className="report-grid">
          {/* Step 1: Report Type */}
          <div className="report-section">
            <div className="section-header">
              <span className="step-number">1</span>
              <h3 className="section-title">Select Report Type</h3>
            </div>
            
            {/* Section-specific error for report types */}
            {reportTypeError && (
              <div className="alert-message error section-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{reportTypeError}</span>
              </div>
            )}
            
            <div className="report-type-cards-compact">
              {reportTypes.map(({ funcName, displayName }) => (
                <div
                  key={funcName}
                  className={`report-card-compact ${selectedReport === funcName ? 'selected' : ''}`}
                  onClick={() => setSelectedReport(funcName)}
                  style={{ 
                    borderColor: selectedReport === funcName ? reportColors[funcName] : '#e9ecef'
                  }}
                >
                  <div 
                    className="report-card-icon-compact"
                    style={{ 
                      backgroundColor: reportColors[funcName] || '#95a5a6',
                      opacity: selectedReport === funcName ? 1 : 0.6
                    }}
                  >
                    {reportIcons[funcName] || '📄'}
                  </div>
                  <div className="report-card-name-compact">{displayName}</div>
                  {selectedReport === funcName && (
                    <div className="report-card-check-compact">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 2: Select Devices (Conditional) */}
          {config.needsDevices && (
            <div className={`report-section ${!selectedReport ? 'disabled' : ''}`}>
              <div className="section-header">
                <span className="step-number">2</span>
                <h3 className="section-title">Select Devices</h3>
                {deviceList.length > 0 && (
                  <div className="header-actions">
                    <button className="text-btn" onClick={selectAllDevices}>Select All</button>
                    <button className="text-btn" onClick={clearAllDevices}>Clear</button>
                  </div>
                )}
              </div>
              
              {/* Section-specific error for devices */}
              {deviceError && (
                <div className="alert-message error section-error">
                  <span className="alert-icon">⚠️</span>
                  <span className="alert-text">{deviceError}</span>
                </div>
              )}
              
              {!selectedReport ? (
                <div className="placeholder-box">
                  <span className="placeholder-icon">👆</span>
                  <p>Please select a report type first</p>
                </div>
              ) : deviceList.length > 0 ? (
                <div className="devices-grid">
                  {deviceList.map((device) => (
                    <label key={device.deviceid} className="device-item">
                      <input
                        type="checkbox"
                        checked={selectedDeviceIds.includes(device.deviceid.toString())}
                        onChange={() => handleDeviceSelection(device.deviceid.toString())}
                      />
                      <span>{device.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="placeholder-box">
                  <span className="placeholder-icon">📦</span>
                  <p>No devices available for this report type</p>
                </div>
              )}
              
              {selectedDeviceIds.length > 0 && (
                <div className="selection-badge">
                  ✓ {selectedDeviceIds.length} device(s) selected
                </div>
              )}
            </div>
          )}

          {/* Step 3: Configure Report */}
          <div className={`report-section ${!selectedReport ? 'disabled' : ''}`}>
            <div className="section-header">
              <span className="step-number">{config.needsDevices ? '3' : '2'}</span>
              <h3 className="section-title">Configure Report</h3>
            </div>
            
            {/* Section-specific error for configuration */}
            {configError && (
              <div className="alert-message error section-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{configError}</span>
              </div>
            )}
            
            <div className="config-form">
              <div className="form-row">
                <div className="form-field">
                  <label>{config.needsEndDate ? 'Start Date' : 'Select Date'}</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field"
                    disabled={!selectedReport}
                  />
                </div>
                
                {config.needsEndDate && (
                  <div className="form-field">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input-field"
                      min={startDate}
                      disabled={!selectedReport}
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                {config.needsFrequency && (
                  <div className="form-field">
                    <label>Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="input-field"
                      disabled={!selectedReport}
                    >
                      <option value="1">1 minute</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>
                )}
                <div className="form-field">
                  <label>Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="input-field"
                    disabled={!selectedReport}
                  >
                    <option value="csv">CSV File</option>
                    <option value="xlsx">Excel File</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Report Summary */}
          {selectedReport && startDate && (!config.needsEndDate || endDate) && (!config.needsDevices || selectedDeviceIds.length > 0) && (
            <div className="report-summary-section">
              <div className="summary-header">
                <span className="summary-icon">📊</span>
                <h4 className="summary-title">Report Summary</h4>
              </div>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-label">Report Type</div>
                  <div className="summary-value">
                    <span className="value-icon" style={{ backgroundColor: reportColors[selectedReport] }}>
                      {reportIcons[selectedReport]}
                    </span>
                    {getSelectedReportData()?.displayName}
                  </div>
                </div>
                
                {config.needsDevices && (
                  <div className="summary-card">
                    <div className="summary-label">Selected Devices</div>
                    <div className="summary-value">
                      <span className="value-number">{selectedDeviceIds.length}</span>
                      {selectedDeviceIds.length === 1 ? 'Device' : 'Devices'}
                    </div>
                  </div>
                )}
                
                <div className="summary-card">
                  <div className="summary-label">{config.needsEndDate ? 'Date Range' : 'Report Date'}</div>
                  <div className="summary-value">
                    📅 {config.needsEndDate ? `${startDate} to ${endDate}` : startDate}
                    {config.needsEndDate && <span className="date-info">({calculateDateDifference()} days)</span>}
                  </div>
                </div>
                
                {config.needsFrequency && (
                  <div className="summary-card">
                    <div className="summary-label">Data Frequency</div>
                    <div className="summary-value">
                      <span className="value-number">{frequency}</span>
                      minute intervals
                    </div>
                  </div>
                )}
                
                <div className="summary-card">
                  <div className="summary-label">Output Format</div>
                  <div className="summary-value">
                    📄 {format.toUpperCase()} File
                  </div>
                </div>
                
                <div className="summary-card">
                  <div className="summary-label">File Name</div>
                  <div className="summary-value filename">
                    {config.needsEndDate 
                      ? `${reportNameMap[selectedReport]}_${startDate}_to_${endDate}.${format}`
                      : `${reportNameMap[selectedReport]}_${startDate}.${format}`
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download Button */}
          <div className="download-area">
            {/* Section-specific error for download */}
            {downloadError && (
              <div className="alert-message error section-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-text">{downloadError}</span>
              </div>
            )}
            
            <button
              onClick={downloadReport}
              disabled={
                loading || 
                !selectedReport || 
                !startDate || 
                (config.needsEndDate && !endDate) ||
                (config.needsDevices && !selectedDeviceIds.length)
              }
              className="download-button"
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <span className="button-icon">📥</span>
                  <span>Download {format.toUpperCase()} Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
