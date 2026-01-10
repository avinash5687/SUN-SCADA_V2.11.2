import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";
import "./ReportPage.css";
import {
  Speed as InverterIcon,
  ElectricMeter as MfmIcon,
  Cable as SmbIcon,
  TransformRounded as TrafoIcon,
  WaterDrop as WmsIcon,
  FilterDrama as DgrIcon,
  Warning as AlarmsIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  CalendarToday as CalendarIcon,
  Description as FileIcon,
  Summarize as SummaryIcon,
  TouchApp as PointerIcon,
  HourglassEmpty as EmptyIcon,
} from "@mui/icons-material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, placeholder = "-- Select --", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    
    if (!isOpen && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const dropdownHeight = Math.min(options.length * 44, 200); // Approximate height
      
      // Open upward if not enough space below and more space above
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
    }
    
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={`custom-select-wrapper-report ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      <div 
        ref={triggerRef}
        className={`custom-select-trigger-report ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
      >
        <span style={{ color: value ? '#2c3e50' : '#95a5a6', fontStyle: value ? 'normal' : 'italic' }}>
          {displayValue}
        </span>
      </div>
      {!disabled && (
        <div className={`custom-select-options-report ${isOpen ? 'open' : ''} ${openUpward ? 'upward' : ''}`}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`custom-select-option-report ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Date Input Component with Calendar Icon
const CustomDateInput = React.forwardRef(({ value, onClick, onChange }, ref) => (
  <div className="custom-date-input-report" onClick={onClick}>
    <input
      type="text"
      value={value || ""}
      onChange={onChange}
      placeholder="YYYY-MM-DD"
      className="date-input-field-report"
      ref={ref}
      onFocus={(e) => e.target.select()}
    />
    <svg
      className="calendar-icon-inline-report"
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

const ReportPage = () => {
  // Default report types (shown even without API)
  const defaultReportTypes = [
    { funcName: "fn_report_inverter", displayName: "Inverter Report" },
    { funcName: "fn_report_mfm", displayName: "MFM Report" },
    { funcName: "fn_report_smb", displayName: "SMB Report" },
    { funcName: "fn_report_trafo", displayName: "Transformer Report" },
    { funcName: "fn_report_wms", displayName: "WMS Report" },
    { funcName: "fn_report_dgr", displayName: "DGR Report" },
    { funcName: "fn_report_alarms", displayName: "Alarms Report" },
  ];

  const [reportTypes, setReportTypes] = useState(defaultReportTypes);
  const [selectedReport, setSelectedReport] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
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

  // Map report types to Material-UI icons
  const reportIconComponents = {
    fn_report_inverter: InverterIcon,
    fn_report_mfm: MfmIcon,
    fn_report_smb: SmbIcon,
    fn_report_trafo: TrafoIcon,
    fn_report_wms: WmsIcon,
    fn_report_dgr: DgrIcon,
    fn_report_alarms: AlarmsIcon,
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
    fn_report_dgr: {
      needsDevices: false,
      needsFrequency: false,
      needsEndDate: false,
    },
    fn_report_alarms: {
      needsDevices: false,
      needsFrequency: false,
      needsEndDate: true,
    },
    default: { needsDevices: true, needsFrequency: true, needsEndDate: true },
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

  // Fetch available report types from API (optional - merges with defaults)
  useEffect(() => {
    const fetchReportTypes = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.report.list);
        const apiTypes = response.data || [];
        
        // Merge API data with defaults (API takes precedence)
        if (apiTypes.length > 0) {
          setReportTypes(apiTypes);
          console.log("Report types loaded from API:", apiTypes);
        } else {
          console.log("Using default report types");
        }
        setReportTypeError("");
      } catch (err) {
        console.error("Failed to load report types from API:", err);
        console.log("Using default report types");
        // Keep using defaultReportTypes - no error shown
      }
    };

    fetchReportTypes();
  }, []);

  // Fetch devices when report type changes
  useEffect(() => {
    const fetchDevices = async () => {
      setDeviceError("");

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

          console.log("Alarm devices loaded:", devices);
          setDeviceList(devices);
          setSelectedDeviceIds([]);
          return;
        } catch (err) {
          console.error("Failed to load alarm devices:", err);
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
        console.log(`Devices loaded for ${devicename}:`, response.data);
      } catch (err) {
        console.error("Failed to load devices:", err);
        setDeviceList([]);
        setDeviceError(
          `Failed to load devices for ${devicename}. Please try selecting another report type.`
        );
      }
    };

    fetchDevices();
  }, [selectedReport]);

  const handleDeviceSelection = (deviceId) => {
    setSelectedDeviceIds((prev) => {
      if (prev.includes(deviceId)) {
        return prev.filter((id) => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  const selectAllDevices = () => {
    setSelectedDeviceIds(deviceList.map((d) => d.deviceid.toString()));
  };

  const clearAllDevices = () => {
    setSelectedDeviceIds([]);
  };

  const downloadReport = async () => {
    const config = getReportConfig(selectedReport);

    clearAllErrors();

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
        startDate: startDate.toISOString().split('T')[0],
        format,
      };

      if (config.needsEndDate) {
        params.endDate = endDate.toISOString().split('T')[0];
      }

      if (config.needsDevices) {
        const deviceIds = selectedDeviceIds.map((id) => parseInt(id, 10));
        params.deviceIds = JSON.stringify(deviceIds);
      }

      if (config.needsFrequency) {
        params.frequency = frequency;
      }

      console.log("Downloading report with params:", params);

      const response = await axios.get(API_ENDPOINTS.report.run, {
        params,
        responseType: "blob",
      });

      const mime =
        format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv";
      const ext = format === "xlsx" ? "xlsx" : "csv";

      const reportName = reportNameMap[selectedReport] || "Report";
      const fileName = config.needsEndDate
        ? `${reportName}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.${ext}`
        : `${reportName}_${startDate.toISOString().split('T')[0]}.${ext}`;

      const blob = new Blob([response.data], { type: mime });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      setSuccess(`${fileName} downloaded successfully!`);
      setTimeout(() => setSuccess(""), 5000);

      console.log("Report downloaded:", fileName);
    } catch (err) {
      console.error("Download failed:", err);
      setDownloadError(
        "Failed to download report. Please check your selections and try again."
      );
      setTimeout(() => setDownloadError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedReportData = () => {
    return reportTypes.find((r) => r.funcName === selectedReport);
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
            <CheckIcon className="alert-icon" style={{ color: "#28a745" }} />
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
                <ErrorIcon className="alert-icon" style={{ color: "#dc3545" }} />
                <span className="alert-text">{reportTypeError}</span>
              </div>
            )}

            <div className="report-type-cards-compact">
              {reportTypes.map(({ funcName, displayName }) => {
                const IconComponent = reportIconComponents[funcName] || FileIcon;
                return (
                  <div
                    key={funcName}
                    className={`report-card-compact ${
                      selectedReport === funcName ? "selected" : ""
                    }`}
                    onClick={() => setSelectedReport(funcName)}
                    style={{
                      borderColor:
                        selectedReport === funcName
                          ? reportColors[funcName]
                          : "#e9ecef",
                    }}
                  >
                    <div
                      className="report-card-icon-compact"
                      style={{
                        backgroundColor: reportColors[funcName] || "#95a5a6",
                        opacity: selectedReport === funcName ? 1 : 0.6,
                      }}
                    >
                      <IconComponent style={{ fontSize: "24px", color: "white" }} />
                    </div>
                    <div className="report-card-name-compact">{displayName}</div>
                    {selectedReport === funcName && (
                      <div className="report-card-check-compact">
                        <CheckIcon style={{ fontSize: "20px", color: reportColors[funcName] }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Devices (Conditional) */}
          {config.needsDevices && (
            <div
              className={`report-section ${
                !selectedReport ? "disabled" : ""
              }`}
            >
              <div className="section-header">
                <span className="step-number">2</span>
                <h3 className="section-title">Select Devices</h3>
                {deviceList.length > 0 && (
                  <div className="header-actions">
                    <button
                      className="text-btn"
                      onClick={selectAllDevices}
                      type="button"
                    >
                      Select All
                    </button>
                    <button
                      className="text-btn"
                      onClick={clearAllDevices}
                      type="button"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Section-specific error for devices */}
              {deviceError && (
                <div className="alert-message error section-error">
                  <ErrorIcon className="alert-icon" style={{ color: "#dc3545" }} />
                  <span className="alert-text">{deviceError}</span>
                </div>
              )}

              {!selectedReport ? (
                <div className="placeholder-box">
                  <PointerIcon style={{ fontSize: "48px", color: "#95a5a6" }} />
                  <p>Please select a report type first</p>
                </div>
              ) : deviceList.length > 0 ? (
                <div className="devices-grid">
                  {deviceList.map((device) => (
                    <label key={device.deviceid} className="device-item">
                      <input
                        type="checkbox"
                        checked={selectedDeviceIds.includes(
                          device.deviceid.toString()
                        )}
                        onChange={() =>
                          handleDeviceSelection(device.deviceid.toString())
                        }
                      />
                      <span>{device.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="placeholder-box">
                  <EmptyIcon style={{ fontSize: "48px", color: "#95a5a6" }} />
                  <p>No devices available for this report type</p>
                </div>
              )}

              {selectedDeviceIds.length > 0 && (
                <div className="selection-badge">
                  <CheckIcon style={{ fontSize: "16px" }} /> {selectedDeviceIds.length}{" "}
                  device(s) selected
                </div>
              )}
            </div>
          )}

          {/* Step 3: Configure Report */}
          <div
            className={`report-section ${
              !selectedReport ? "disabled" : ""
            }`}
          >
            <div className="section-header">
              <span className="step-number">
                {config.needsDevices ? "3" : "2"}
              </span>
              <h3 className="section-title">Configure Report</h3>
            </div>

            {/* Section-specific error for configuration */}
            {configError && (
              <div className="alert-message error section-error">
                <ErrorIcon className="alert-icon" style={{ color: "#dc3545" }} />
                <span className="alert-text">{configError}</span>
              </div>
            )}

            <div className="config-form">
              <div className="form-row">
                <div className="form-field">
                  <label>
                    {config.needsEndDate ? "Start Date" : "Select Date"}
                  </label>
                  <div className="date-picker-container-report">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="yyyy-MM-dd"
                      customInput={<CustomDateInput />}
                      calendarClassName="custom-calendar-report"
                      placeholderText="yyyy-mm-dd"
                      disabled={!selectedReport}
                    />
                  </div>
                </div>

                {config.needsEndDate && (
                  <div className="form-field">
                    <label>End Date</label>
                    <div className="date-picker-container-report">
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="yyyy-MM-dd"
                        customInput={<CustomDateInput />}
                        calendarClassName="custom-calendar-report"
                        placeholderText="yyyy-mm-dd"
                        minDate={startDate}
                        disabled={!selectedReport}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-row">
                {config.needsFrequency && (
                  <div className="form-field">
                    <label>Frequency</label>
                    <CustomDropdown
                      options={[
                        { value: "1", label: "1 minute" },
                        { value: "15", label: "15 minutes" },
                        { value: "30", label: "30 minutes" },
                        { value: "60", label: "60 minutes" },
                      ]}
                      value={frequency}
                      onChange={setFrequency}
                      placeholder="Select Frequency"
                      disabled={!selectedReport}
                    />
                  </div>
                )}
                <div className="form-field">
                  <label>Format</label>
                  <CustomDropdown
                    options={[
                      { value: "csv", label: "CSV File" },
                      { value: "xlsx", label: "Excel File" },
                    ]}
                    value={format}
                    onChange={setFormat}
                    placeholder="Select Format"
                    disabled={!selectedReport}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Report Summary */}
          {selectedReport &&
            startDate &&
            (!config.needsEndDate || endDate) &&
            (!config.needsDevices || selectedDeviceIds.length > 0) && (
              <div className="report-summary-section">
                <div className="summary-header">
                  <SummaryIcon style={{ fontSize: "24px", color: "#3498db" }} />
                  <h4 className="summary-title">Report Summary</h4>
                </div>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-label">Report Type</div>
                    <div className="summary-value">
                      <span
                        className="value-icon"
                        style={{
                          backgroundColor: reportColors[selectedReport],
                        }}
                      >
                        {React.createElement(
                          reportIconComponents[selectedReport] || FileIcon,
                          { style: { fontSize: "16px", color: "white" } }
                        )}
                      </span>
                      {getSelectedReportData()?.displayName}
                    </div>
                  </div>

                  {config.needsDevices && (
                    <div className="summary-card">
                      <div className="summary-label">Selected Devices</div>
                      <div className="summary-value">
                        <span className="value-number">
                          {selectedDeviceIds.length}
                        </span>
                        {selectedDeviceIds.length === 1
                          ? "Device"
                          : "Devices"}
                      </div>
                    </div>
                  )}

                  <div className="summary-card">
                    <div className="summary-label">
                      {config.needsEndDate ? "Date Range" : "Report Date"}
                    </div>
                    <div className="summary-value">
                      <CalendarIcon style={{ fontSize: "16px", marginRight: "4px" }} />
                      {config.needsEndDate
                        ? ` ${startDate} to ${endDate}`
                        : ` ${startDate}`}
                      {config.needsEndDate && (
                        <span className="date-info">
                          ({calculateDateDifference()} days)
                        </span>
                      )}
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
                      <FileIcon style={{ fontSize: "16px", marginRight: "4px" }} />
                      {format.toUpperCase()} File
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-label">File Name</div>
                    <div className="summary-value filename">
                      {config.needsEndDate
                        ? `${reportNameMap[selectedReport]}_${startDate}_to_${endDate}.${format}`
                        : `${reportNameMap[selectedReport]}_${startDate}.${format}`}
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
                <ErrorIcon className="alert-icon" style={{ color: "#dc3545" }} />
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
              type="button"
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  <span>Generating Report...</span>
                </>
              ) : (
                <>
                  <DownloadIcon style={{ fontSize: "20px", marginRight: "8px" }} />
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
