import React, { useState, useEffect, useCallback, useMemo } from "react";
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
    Visibility as ViewIcon,
    Warning as WarningIcon,
    CheckCircle as CheckIcon,
    Error as ErrorIcon
} from "@mui/icons-material";
import "./SmbScreen.css";

const SMBScreen = () => {
    // State management following your Inverter.js pattern
    const [smbData, setSMBData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [lastUpdated, setLastUpdated] = useState("");
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [showDeviceDetails, setShowDeviceDetails] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    // Simple API URL - exactly like your inverter approach
    const SMB_API_URL = "/api/smb";

    // Data fetching following your exact Inverter.js pattern
    const fetchSMBData = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            }

            const API_TIMEOUT = 10000;
            const axiosConfig = { timeout: API_TIMEOUT };

            console.time('SMB API Fetch');

            const response = await axios.get(SMB_API_URL, {
                params: { _: Date.now() },
                ...axiosConfig
            });

            console.log('SMB API Response:', response);

            if (response.data) {
                const data = Array.isArray(response.data) ? response.data : [response.data];
                setSMBData(data);
                setLastUpdated(`Last updated: ${new Date().toLocaleString()}`);
                setLoading(false);
                console.log('✅ SMB data loaded:', data.length, 'devices');
            }

            // Mark initial load as complete after first attempt
            if (initialLoad) {
                setTimeout(() => setInitialLoad(false), 1000);
            }

            console.timeEnd('SMB API Fetch');
            console.log('✅ SMB data fetch completed');

        } catch (error) {
            console.error("Error fetching SMB data:", error);
            setLoading(false);
            setSMBData([]); // Set empty array on error
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchSMBData(false);
        const interval = setInterval(() => fetchSMBData(true), 30000);
        return () => clearInterval(interval);
    }, []);

    // Responsive handling
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Data processing and filtering
    const processedData = useMemo(() => {
        if (!Array.isArray(smbData) || smbData.length === 0) {
            return [];
        }

        return smbData.map(device => {
            // Calculate active strings (non-zero current)
            const stringCurrents = Array.from({ length: 24 }, (_, i) => device[`STR_CRNT${i + 1}`] || 0);
            const activeStrings = stringCurrents.filter(current => current > 0);
            const totalStrings = 24;
            const activeStringCount = activeStrings.length;

            // Determine device status
            let status = 'OFFLINE';
            let statusColor = '#6c757d';

            if (device.POWER > 0) {
                status = 'GENERATING';
                statusColor = '#28a745';
            } else if (activeStringCount > 0) {
                status = 'STANDBY';
                statusColor = '#ffc107';
            } else if (device.VOLTAGE > 0) {
                status = 'ONLINE';
                statusColor = '#17a2b8';
            }

            // Temperature status
            let tempStatus = 'NORMAL';
            if (device.INT_TEMP > 500) tempStatus = 'HIGH';
            else if (device.INT_TEMP > 450) tempStatus = 'WARNING';

            return {
                ...device,
                stringCurrents,
                activeStrings,
                activeStringCount,
                totalStrings,
                status,
                statusColor,
                tempStatus,
                efficiency: device.POWER > 0 ? ((device.POWER / (device.TOTAL_CRNT * device.VOLTAGE)) * 100).toFixed(1) : 0
            };
        });
    }, [smbData]);

    // Filtered data based on status filter
    const filteredData = useMemo(() => {
        if (filterStatus === "all") return processedData;
        if (filterStatus === "active") return processedData.filter(d => d.status === 'GENERATING');
        if (filterStatus === "standby") return processedData.filter(d => d.status === 'STANDBY');
        if (filterStatus === "inactive") return processedData.filter(d => d.status === 'OFFLINE');
        return processedData;
    }, [processedData, filterStatus]);

    // Statistics for header
    const statistics = useMemo(() => {
    const total = processedData.length;
    const generating = processedData.filter(d => d.status === 'GENERATING').length;
    const standby = processedData.filter(d => d.status === 'STANDBY').length;
    const offline = processedData.filter(d => d.status === 'OFFLINE').length;
    const totalPower = processedData.reduce((sum, d) => sum + (d.POWER || 0), 0);
    const totalCurrent = processedData.reduce((sum, d) => sum + (d.TOTAL_CRNT || 0), 0);

    return { total, generating, standby, offline, totalPower, totalCurrent };
    }, [processedData]);

    // String current visualization component
    const StringCurrentDisplay = ({ stringCurrents, deviceId }) => {
        const maxCurrent = Math.max(...stringCurrents, 1);

        return (
            <div className="string-current-display">
                <div className="string-grid">
                    {stringCurrents.map((current, index) => (
                        <Tooltip
                            key={index}
                            title={`String ${index + 1}: ${current}A`}
                            placement="top"
                        >
                            <div
                                className={`string-bar ${current > 0 ? 'active' : 'inactive'}`}
                                style={{
                                    height: `${Math.max((current / maxCurrent) * 100, 2)}%`,
                                    backgroundColor: current > 0
                                        ? `hsl(${120 - (current / maxCurrent) * 60}, 70%, 50%)`
                                        : '#e9ecef'
                                }}
                            >
                                <span className="string-value">{current}</span>
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
                <div className="device-info">
                    <h4 className="device-title">SMB-{device.DEVICE_ID}</h4>
                    <Chip
                        label={device.status}
                        size="small"
                        style={{
                            backgroundColor: device.statusColor,
                            color: 'white',
                            fontSize: '0.6rem',
                            height: '18px'
                        }}
                    />
                </div>
                <IconButton
                    size="small"
                    onClick={() => {
                        setSelectedDevice(device);
                        setShowDeviceDetails(true);
                    }}
                    className="details-btn"
                >
                    <ViewIcon fontSize="small" />
                </IconButton>
            </div>

            <div className="smb-card-content">
                <div className="primary-metrics">
                    <div className="metric-item">
                        <BoltIcon className="metric-icon power" />
                        <div className="metric-data">
                            <span className="metric-label">Power</span>
                            <span className="metric-value">{device.POWER} kW</span>
                        </div>
                    </div>

                    <div className="metric-item">
                        <CableIcon className="metric-icon current" />
                        <div className="metric-data">
                            <span className="metric-label">Current</span>
                            <span className="metric-value">{device.TOTAL_CRNT} A</span>
                        </div>
                    </div>

                    <div className="metric-item">
                        <SpeedIcon className="metric-icon voltage" />
                        <div className="metric-data">
                            <span className="metric-label">Voltage</span>
                            <span className="metric-value">{device.VOLTAGE} V</span>
                        </div>
                    </div>

                    <div className="metric-item">
                        <ThermoIcon className="metric-icon temperature" />
                        <div className="metric-data">
                            <span className="metric-label">Temperature</span>
                            <span className="metric-value">{device.INT_TEMP}°C</span>
                        </div>
                    </div>
                </div>

                <div className="string-status">
                    <div className="string-summary">
                        <span className="active-strings">{device.activeStringCount}/24 Strings Active</span>
                    </div>
                    <StringCurrentDisplay
                        stringCurrents={device.stringCurrents}
                        deviceId={device.DEVICE_ID}
                    />
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
                style: { borderRadius: '12px' }
            }}
        >
            {selectedDevice && (
                <>
                    <DialogTitle className="compact-dialog-title">
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="h6" className="dialog-title-text">
                                SMB Device {selectedDevice.DEVICE_ID}
                            </Typography>
                            <Chip
                                label={selectedDevice.status}
                                size="small"
                                style={{ backgroundColor: selectedDevice.statusColor, color: 'white' }}
                            />
                        </Box>
                    </DialogTitle>

                    <DialogContent className="compact-dialog-content">
                        <div className="compact-device-details">
                            {/* Device Overview - Compact Grid */}
                            <div className="compact-overview-grid">
                                <div className="compact-metric">
                                    <span className="compact-label">Power</span>
                                    <span className="compact-value">{selectedDevice.POWER} kW</span>
                                </div>
                                <div className="compact-metric">
                                    <span className="compact-label">Current</span>
                                    <span className="compact-value">{selectedDevice.TOTAL_CRNT} A</span>
                                </div>
                                <div className="compact-metric">
                                    <span className="compact-label">Voltage</span>
                                    <span className="compact-value">{selectedDevice.VOLTAGE} V</span>
                                </div>
                                <div className="compact-metric">
                                    <span className="compact-label">Int. Temp</span>
                                    <span className="compact-value">{selectedDevice.INT_TEMP}°C</span>
                                </div>
                                <div className="compact-metric">
                                    <span className="compact-label">Active Strings</span>
                                    <span className="compact-value">{selectedDevice.activeStringCount}/24</span>
                                </div>
                                <div className="compact-metric">
                                    <span className="compact-label">Last Update</span>
                                    <span className="compact-value">{selectedDevice.Date_Time}</span>
                                </div>
                            </div>

                            {/* String Current Details - Compact */}
                            <div className="compact-strings-section">
                                <h6 className="compact-section-title">String Current Details</h6>
                                <div className="compact-string-grid">
                                    {selectedDevice.stringCurrents.map((current, index) => (
                                        <div
                                            key={index}
                                            className={`compact-string-item ${current > 0 ? 'active' : 'inactive'}`}
                                        >
                                            <span className="string-num">S{index + 1}</span>
                                            <span className="string-val">{current}A</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>

                    <DialogActions className="compact-dialog-actions">
                        <Button
                            onClick={() => setShowDeviceDetails(false)}
                            variant="contained"
                            size="small"
                            className="close-button"
                        >
                            Close
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );

    return (
        <div className="smb-container">
            {/* Fixed Header Layout */}
            <div className="smb-header">
                <div className="header-left">
                    <h2 className="smb-title">String Monitoring Box Overview</h2>
                </div>

                <div className="header-right">
                    {refreshing && (
                        <div className="refresh-indicator">
                            <div className="refresh-spinner"></div>
                            <span>Refreshing...</span>
                        </div>
                    )}
                    <div className="total-power-display">
                        <strong>{(statistics.totalPower / 1000).toFixed(1)} MW</strong> Total Power
                    </div>
                    <div className="filter-buttons">
                        {[
                            { key: "all", label: "All Devices", count: statistics.total },
                            { key: "active", label: "Generating", count: statistics.generating },
                            { key: "standby", label: "Standby", count: statistics.standby },
                            { key: "inactive", label: "Offline", count: statistics.offline }
                        ].map(filter => (
                            <button
                                key={filter.key}
                                className={`filter-btn ${filterStatus === filter.key ? 'active' : ''}`}
                                onClick={() => setFilterStatus(filter.key)}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {initialLoad && loading && (
                <div className="smb-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading SMB data...</span>
                </div>
            )}

            {/* Main Content */}
            {(!initialLoad || !loading) && (
                <div className="smb-content">
                    {filteredData.length === 0 ? (
                        <div className="no-data-message">
                            <Typography variant="h6">No devices found</Typography>
                            <Typography variant="body2">
                                {filterStatus === "all"
                                    ? "No SMB devices are currently available."
                                    : `No devices are currently ${filterStatus}.`
                                }
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

            {/* Device Details Dialog */}
            <DeviceDetailsDialog />
        </div>
    );
};

export default SMBScreen;
