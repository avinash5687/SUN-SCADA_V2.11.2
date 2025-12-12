import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
    Tooltip,
    Chip,
    Typography,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from "@mui/material";
import {
    Speed as SpeedIcon,
    ThermostatAuto as ThermoIcon,
    Bolt as BoltIcon,
    Cable as CableIcon,
    Visibility as ViewIcon
} from "@mui/icons-material";
import "./SmbScreen.css";

const MAX_STRINGS = 24;

const SMBScreen = () => {
    const [smbData, setSMBData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showDeviceDetails, setShowDeviceDetails] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");

    const SMB_API_URL = "/api/smb";

    const fetchSMBData = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);

            const API_TIMEOUT = 10000;
            const axiosConfig = { timeout: API_TIMEOUT };

            console.time("SMB API Fetch");

            const response = await axios.get(SMB_API_URL, {
                params: { _: Date.now() },
                ...axiosConfig
            });

            if (response.data) {
                const apiData = Array.isArray(response.data) ? response.data : [response.data];

                // Normalize API fields to match frontend expectations
                const normalizedData = apiData.map(item => {
                    const normalized = {
                        DEVICE_ID: item.device_id || item.DEVICEID || item.DEVICE_ID || "",
                        POWER: item.power || item.POWER || 0,
                        VOLTAGE: item.voltage || item.VOLTAGE || 0,
                        INT_TEMP: item.internal_temp || item.INT_TEMP || 0,
                        EXT_TEMP: item.external_temp || item.EXT_TEMP || 0,
                        TOTAL_CRNT: item.total_current || item.TOTAL_CRNT || 0,
                        Date_Time: item.date_time || item.Date_Time || new Date().toLocaleString()
                    };

                    // Include string currents (handle up to 24)
                    for (let i = 1; i <= MAX_STRINGS; i++) {
                        normalized[`STR_CRNT${i}`] =
                            item[`string_current${i}`] ||
                            item[`STRING_CURRENT${i}`] ||
                            item[`STR_CRNT${i}`] ||
                            0;
                    }

                    return normalized;
                });

                setSMBData(normalizedData);
                setLastUpdated(`Last updated: ${new Date().toLocaleString()}`);
                setLoading(false);
                console.log("✅ SMB data loaded:", normalizedData.length, "devices");
            }

            if (initialLoad) {
                setTimeout(() => setInitialLoad(false), 1000);
            }

            console.timeEnd("SMB API Fetch");
            console.log("✅ SMB data fetch completed");
        } catch (error) {
            console.error("Error fetching SMB data:", error);
            setLoading(false);
            setSMBData([]);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSMBData(false);
        const interval = setInterval(() => fetchSMBData(true), 30000);
        return () => clearInterval(interval);
    }, []);

    // Data processing and filtering
    const processedData = useMemo(() => {
        if (!Array.isArray(smbData) || smbData.length === 0) return [];

        return smbData.map(device => {
            const stringCurrents = Array.from({ length: MAX_STRINGS }, (_, i) => device[`STR_CRNT${i + 1}`] || 0);
            const activeStrings = stringCurrents.filter(current => current > 0);
            const totalStrings = MAX_STRINGS;
            const activeStringCount = activeStrings.length;

            // Determine device status
            let status = "OFFLINE";
            let statusColor = "#6c757d";

            if (device.POWER > 0) {
                status = "GENERATING";
                statusColor = "#28a745";
            } else if (activeStringCount > 0) {
                status = "STANDBY";
                statusColor = "#ffc107";
            } else if (device.VOLTAGE > 0) {
                status = "ONLINE";
                statusColor = "#17a2b8";
            }

            // Temperature status (retained for potential styling)
            let tempStatus = "NORMAL";
            if (device.INT_TEMP > 500) tempStatus = "HIGH";
            else if (device.INT_TEMP > 450) tempStatus = "WARNING";

            return {
                ...device,
                stringCurrents,
                activeStrings,
                activeStringCount,
                totalStrings,
                status,
                statusColor,
                tempStatus,
                efficiency:
                    device.POWER > 0 && device.TOTAL_CRNT && device.VOLTAGE
                        ? ((device.POWER / (device.TOTAL_CRNT * device.VOLTAGE)) * 100).toFixed(1)
                        : 0
            };
        });
    }, [smbData]);

    // Filtered data based on status filter
    const filteredData = useMemo(() => {
        if (filterStatus === "all") return processedData;
        if (filterStatus === "active") return processedData.filter(d => d.status === "GENERATING");
        if (filterStatus === "standby") return processedData.filter(d => d.status === "STANDBY");
        if (filterStatus === "inactive") return processedData.filter(d => d.status === "OFFLINE");
        return processedData;
    }, [processedData, filterStatus]);

    // Statistics for header
    const statistics = useMemo(() => {
        const total = processedData.length;
        const generating = processedData.filter(d => d.status === "GENERATING").length;
        const standby = processedData.filter(d => d.status === "STANDBY").length;
        const offline = processedData.filter(d => d.status === "OFFLINE").length;
        const totalPower = processedData.reduce((sum, d) => sum + (Number(d.POWER) || 0), 0);
        const totalCurrent = processedData.reduce((sum, d) => sum + (d.TOTAL_CRNT || 0), 0);

        return { total, generating, standby, offline, totalPower, totalCurrent };
    }, [processedData]);

    // String current visualization component
    const StringCurrentDisplay = ({ stringCurrents, deviceId }) => {
        const maxCurrent = Math.max(...stringCurrents, 1);

        return (
            <div className="smb-string-current-display">
                <div className="smb-string-grid smb-string-grid-24">
                    {stringCurrents.map((current, index) => (
                        <Tooltip key={index} title={`String ${index + 1}: ${current}A`} placement="top">
                            <div
                                className={`smb-string-bar ${current > 0 ? "active" : "inactive"}`}
                                style={{
                                    height: `${Math.max((current / maxCurrent) * 100, 2)}%`,
                                    backgroundColor:
                                        current > 0
                                            ? `hsl(${120 - (current / maxCurrent) * 60}, 70%, 50%)`
                                            : "#e9ecef"
                                }}
                            >
                                <span className="smb-string-value">{current}</span>
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </div>
        );
    };

    // Device card component
    const DeviceCard = ({ device }) => (
        <div className={`smb-device-card ${device.status.toLowerCase()}`}>
            <div className="smb-card-header">
                <div className="smb-device-info">
                    <h4 className="smb-device-title">SMB-{device.DEVICE_ID}</h4>
                    <Chip
                        label={device.status}
                        size="small"
                        style={{
                            backgroundColor: device.statusColor,
                            color: "white",
                            fontSize: "0.6rem",
                            height: "18px"
                        }}
                    />
                </div>
                <IconButton
                    size="small"
                    onClick={() => {
                        setSelectedDevice(device);
                        setShowDeviceDetails(true);
                    }}
                    className="smb-details-btn"
                >
                    <ViewIcon fontSize="small" />
                </IconButton>
            </div>

            <div className="smb-card-content">
                <div className="smb-primary-metrics">
                    <div className="smb-metric-item">
                        <BoltIcon className="smb-metric-icon power" />
                        <div className="smb-metric-data">
                            <span className="smb-metric-label">Power</span>
                            <span className="smb-metric-value">{device.POWER} kW</span>
                        </div>
                    </div>

                    <div className="smb-metric-item">
                        <CableIcon className="smb-metric-icon current" />
                        <div className="smb-metric-data">
                            <span className="smb-metric-label">Current</span>
                            <span className="smb-metric-value">{device.TOTAL_CRNT} A</span>
                        </div>
                    </div>

                    <div className="smb-metric-item">
                        <SpeedIcon className="smb-metric-icon voltage" />
                        <div className="smb-metric-data">
                            <span className="smb-metric-label">Voltage</span>
                            <span className="smb-metric-value">{device.VOLTAGE} V</span>
                        </div>
                    </div>

                    <div className="smb-metric-item">
                        <ThermoIcon className="smb-metric-icon temperature" />
                        <div className="smb-metric-data">
                            <span className="smb-metric-label">Temperature</span>
                            <span className="smb-metric-value">{device.INT_TEMP}°C</span>
                        </div>
                    </div>
                </div>

                <div className="smb-string-status">
                    <div className="smb-string-summary">
                        <span className="smb-active-strings">
                            {device.activeStringCount}/{device.totalStrings} Strings Active
                        </span>
                    </div>
                    <StringCurrentDisplay stringCurrents={device.stringCurrents} deviceId={device.DEVICE_ID} />
                </div>
            </div>
        </div>
    );

    // Compact Device details dialog
    const DeviceDetailsDialog = () => (
        <Dialog
            open={showDeviceDetails}
            onClose={() => setShowDeviceDetails(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
                style: { borderRadius: "12px" }
            }}
        >
            {selectedDevice && (
                <>
                    <DialogTitle className="smb-compact-dialog-title">
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" className="smb-dialog-title-text">
                                SMB Device {selectedDevice.DEVICE_ID}
                            </Typography>
                            <Chip
                                label={selectedDevice.status}
                                size="small"
                                style={{ backgroundColor: selectedDevice.statusColor, color: "white" }}
                            />
                        </Box>
                    </DialogTitle>

                    <DialogContent className="smb-compact-dialog-content">
                        <div className="smb-compact-device-details">
                            <div className="smb-compact-overview-grid">
                                <div className="smb-compact-metric">
                                    <span className="smb-compact-label">Power</span>
                                    <span className="smb-compact-value">{selectedDevice.POWER} kW</span>
                                </div>
                                <div className="smb-compact-metric">
                                    <span className="smb-compact-label">Current</span>
                                    <span className="smb-compact-value">{selectedDevice.TOTAL_CRNT} A</span>
                                </div>
                                <div className="smb-compact-metric">
                                    <span className="smb-compact-label">Voltage</span>
                                    <span className="smb-compact-value">{selectedDevice.VOLTAGE} V</span>
                                </div>
                                <div className="smb-compact-metric">
                                    <span className="smb-compact-label">Int. Temp</span>
                                    <span className="smb-compact-value">{selectedDevice.INT_TEMP}°C</span>
                                </div>
                                <div className="smb-compact-metric">
                                    <span className="smb-compact-label">Active Strings</span>
                                    <span className="smb-compact-value">
                                        {selectedDevice.activeStringCount}/{selectedDevice.totalStrings}
                                    </span>
                                </div>
                                <div className="smb-compact-metric">
                                    <span className="smb-compact-label">Last Update</span>
                                    <span className="smb-compact-value">{selectedDevice.Date_Time}</span>
                                </div>
                            </div>

                            <div className="smb-compact-strings-section">
                                <h6 className="smb-compact-section-title">String Current Details</h6>
                                <div className="smb-compact-string-grid smb-compact-string-grid-24">
                                    {selectedDevice.stringCurrents.map((current, index) => (
                                        <div
                                            key={index}
                                            className={`smb-compact-string-item ${current > 0 ? "active" : "inactive"}`}
                                        >
                                            <span className="smb-string-num">S{index + 1}</span>
                                            <span className="smb-string-val">{current}A</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>

                    <DialogActions className="smb-compact-dialog-actions">
                        <Button onClick={() => setShowDeviceDetails(false)} variant="contained" size="small" className="smb-close-button">
                            Close
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );

    return (
        <div className="smb-container">
            {/* HEADER - ALWAYS VISIBLE */}
            <div className="smb-header">
                <div className="smb-header-left">
                    <h2 className="smb-title">String Monitoring Box Overview</h2>
                </div>

                <div className="smb-header-right">
                    {refreshing && (
                        <div className="smb-refresh-indicator">
                            <div className="smb-refresh-spinner"></div>
                            <span>Refreshing...</span>
                        </div>
                    )}
                    <div className="smb-total-power-display">
                        {(!isNaN(statistics.totalPower) && statistics.totalPower != null 
                            ? (statistics.totalPower / 1000).toFixed(2) 
                            : "0.00")} MW Total Power
                    </div>
                    <div className="smb-filter-buttons">
                        {[
                            { key: "all", label: "All Devices", count: statistics.total },
                            { key: "active", label: "Generating", count: statistics.generating },
                            { key: "standby", label: "Standby", count: statistics.standby },
                            { key: "inactive", label: "Offline", count: statistics.offline }
                        ].map(filter => (
                            <button
                                key={filter.key}
                                className={`smb-filter-btn ${filterStatus === filter.key ? "active" : ""}`}
                                onClick={() => setFilterStatus(filter.key)}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* LOADING STATE */}
            {initialLoad && loading ? (
                <div className="smb-loading">
                    <div className="smb-loading-spinner"></div>
                    <span>Loading SMB data...</span>
                </div>
            ) : (
                /* CONTENT AREA */
                <div className="smb-content">
                    {filteredData.length === 0 ? (
                        <div className="smb-no-data-message">
                            <Typography variant="h6">No devices found</Typography>
                            <Typography variant="body2">
                                {filterStatus === "all" 
                                    ? "No SMB devices are currently available." 
                                    : `No devices are currently ${filterStatus}.`}
                            </Typography>
                        </div>
                    ) : (
                        <div className="smb-device-grid">
                            {filteredData.map(device => (
                                <DeviceCard key={device.DEVICE_ID} device={device} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <DeviceDetailsDialog />
        </div>
    );
};

export default SMBScreen;
