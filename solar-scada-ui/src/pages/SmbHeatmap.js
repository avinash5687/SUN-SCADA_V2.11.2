import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./SmbHeatmap.css";

const SMB_Heatmap = () => {
  const [smbData, setSmbData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  // Refs to prevent flickering
  const initialLoadRef = useRef(false);
  const prevSmbDataRef = useRef({});

  // Direct API endpoint
  const SMB_API_URL = "/api/smb";

  const smbCount = 75;
  const smbsPerPage = 12;
  const totalPages = Math.ceil(smbCount / smbsPerPage);
  const showPagination = totalPages > 1;

  const allSmbIds = Array.from({ length: smbCount }, (_, i) => i + 1);
  const smbIds = allSmbIds.slice(page * smbsPerPage, page * smbsPerPage + smbsPerPage);

  // Fetch SMB data with flickering prevention
  const fetchSmbData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      const response = await axios.get(SMB_API_URL, { 
        timeout: 10000,
        params: { _: Date.now() }
      });
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const newSmbData = {};
        
        allSmbIds.forEach((id) => {
          const smb = response.data.find((item) => 
            item.DEVICE_ID === id || item.device_id === id
          );
          
          if (smb) {
            newSmbData[id] = {
              device_id: smb.DEVICE_ID || smb.device_id,
              name: `SMB-${smb.DEVICE_ID || smb.device_id}`,
              date_time: smb.Date_Time || smb.date_time,
              string_current1: smb.STR_CRNT1 || 0,
              string_current2: smb.STR_CRNT2 || 0,
              string_current3: smb.STR_CRNT3 || 0,
              string_current4: smb.STR_CRNT4 || 0,
              string_current5: smb.STR_CRNT5 || 0,
              string_current6: smb.STR_CRNT6 || 0,
              string_current7: smb.STR_CRNT7 || 0,
              string_current8: smb.STR_CRNT8 || 0,
              string_current9: smb.STR_CRNT9 || 0,
              string_current10: smb.STR_CRNT10 || 0,
              string_current11: smb.STR_CRNT11 || 0,
              string_current12: smb.STR_CRNT12 || 0,
              string_current13: smb.STR_CRNT13 || 0,
              string_current14: smb.STR_CRNT14 || 0,
              string_current15: smb.STR_CRNT15 || 0,
              string_current16: smb.STR_CRNT16 || 0,
              string_current17: smb.STR_CRNT17 || 0,
              string_current18: smb.STR_CRNT18 || 0,
              string_current19: smb.STR_CRNT19 || 0,
              string_current20: smb.STR_CRNT20 || 0,
              string_current21: smb.STR_CRNT21 || 0,
              string_current22: smb.STR_CRNT22 || 0,
              string_current23: smb.STR_CRNT23 || 0,
              string_current24: smb.STR_CRNT24 || 0,
              total_current: smb.TOTAL_CRNT || smb.total_current || 0,
              voltage: smb.VOLTAGE || smb.voltage || 0,
              power: smb.POWER || smb.power || 0,
              int_temp: smb.INT_TEMP || smb.int_temp || 0,
              ext_temp: smb.EXT_TEMP || smb.ext_temp || 0,
              panel_temp: smb.PANEL_TEMP || smb.panel_temp || 0,
            };
          } else {
            newSmbData[id] = null;
          }
        });

        const hasChanged = JSON.stringify(prevSmbDataRef.current) !== JSON.stringify(newSmbData);
        if (hasChanged || !initialLoadRef.current) {
          requestAnimationFrame(() => {
            setSmbData(newSmbData);
            prevSmbDataRef.current = newSmbData;
            initialLoadRef.current = true;
          });
        }
        
        console.log("✅ SMB Heatmap data loaded:", Object.keys(newSmbData).length, "devices");
      } else {
        console.warn("No SMB data received or empty array");
      }
      if (!isRefresh) setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching SMB data:", error.message);
      if (!isRefresh) setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, [allSmbIds, SMB_API_URL]);

  useEffect(() => {
    fetchSmbData(false);
    const interval = setInterval(() => fetchSmbData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchSmbData]);

  // Parameters
  const parameters = [
    { name: "Timestamp", key: "date_time", unit: "", type: "text" },
    ...Array.from({ length: 24 }, (_, i) => ({
      name: `STR CRNT ${i + 1}`,
      key: `string_current${i + 1}`,
      unit: "A",
      type: "string_current"
    })),
    { name: "TOT CRNT", key: "total_current", unit: "A", type: "numeric" },
    { name: "DC Voltage", key: "voltage", unit: "V", type: "numeric" },
    { name: "Power", key: "power", unit: "KW", type: "numeric" },
    { name: "INT Temp", key: "int_temp", unit: "°C", type: "temperature" },
    { name: "EXT Temp", key: "ext_temp", unit: "°C", type: "temperature" },
    { name: "Panel Temp", key: "panel_temp", unit: "°C", type: "temperature" },
  ];

  // Get color class based on deviation from max value
  const getDeviationClass = (value, max) => {
    if (value === null || value === undefined || value === 0) return "smb-heatmap__cell-zero";
    if (!max || max === 0) return "";
    
    const deviationPercent = ((max - value) / max) * 100;
    
    if (deviationPercent <= 10) return "smb-heatmap__cell-excellent";
    if (deviationPercent <= 30) return "smb-heatmap__cell-good";
    if (deviationPercent <= 60) return "smb-heatmap__cell-warning";
    return "smb-heatmap__cell-critical";
  };

  // Get color class for temperature
  const getTemperatureClass = (value) => {
    if (value === null || value === undefined || value === 0) return "smb-heatmap__cell-zero";
    
    if (value < 30) return "smb-heatmap__cell-excellent";
    if (value < 50) return "smb-heatmap__cell-good";
    if (value < 70) return "smb-heatmap__cell-warning";
    return "smb-heatmap__cell-critical";
  };

  // Format cell value
  const formatValue = (value, type) => {
    if (value === null || value === undefined) return "No Data";
    if (value === 0 && type !== "text") return "0";
    if (type === "text") return value || "No Data";
    return value;
  };

  return (
    <div className="smb-heatmap">
      {/* Header */}
      <div className="smb-heatmap__header">
        <div className="smb-heatmap__header-left">
          <h2 className="smb-heatmap__title">SMB Heatmap</h2>
        </div>

        <div className="smb-heatmap__header-right">
          {refreshing && (
            <div className="smb-heatmap__refresh-indicator">
              <div className="smb-heatmap__refresh-spinner"></div>
              <span>Refreshing...</span>
            </div>
          )}

          {showPagination && (
            <div className="smb-heatmap__pagination">
              <button onClick={() => setPage(0)} disabled={page === 0}>
                « First
              </button>
              <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>
                ‹ Prev
              </button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1}>
                Next ›
              </button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1}>
                Last »
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="smb-heatmap__legend">
        <div className="smb-heatmap__legend-content">
          <span>
            <b>Deviation Legend:</b>
          </span>
          <span className="smb-heatmap__legend-item">
            <span className="smb-heatmap__dot smb-heatmap__dot-excellent"></span> Excellent (0–10%)
          </span>
          <span className="smb-heatmap__legend-item">
            <span className="smb-heatmap__dot smb-heatmap__dot-good"></span> Good (10–30%)
          </span>
          <span className="smb-heatmap__legend-item">
            <span className="smb-heatmap__dot smb-heatmap__dot-warning"></span> Warning (30–60%)
          </span>
          <span className="smb-heatmap__legend-item">
            <span className="smb-heatmap__dot smb-heatmap__dot-critical"></span> Critical (60%+)
          </span>
          <span className="smb-heatmap__legend-item">
            <span className="smb-heatmap__dot smb-heatmap__dot-zero"></span> Zero/Inactive
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="smb-heatmap__loading">
          <div className="smb-heatmap__loading-spinner"></div>
          <span>Loading SMB data...</span>
        </div>
      ) : (
        <div className="smb-heatmap__content">
          <div className="smb-heatmap__table-wrapper">
            <table className="smb-heatmap__table">
              <thead>
                <tr>
                  <th className="smb-heatmap__header-cell">Parameters</th>
                  {smbIds.map((id) => (
                    <th key={id} className="smb-heatmap__header-cell">
                      {smbData[id]?.name || `SMB-${id}`}
                    </th>
                  ))}
                  <th className="smb-heatmap__header-cell">Unit</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param, idx) => (
                  <tr key={idx}>
                    <td className="smb-heatmap__param-cell">{param.name}</td>
                    {smbIds.map((id) => {
                      const smb = smbData[id];
                      
                      if (!smb) {
                        return (
                          <td key={id} className="smb-heatmap__no-data-cell">
                            No Data
                          </td>
                        );
                      }

                      const value = smb[param.key];

                      // String current cells with color coding
                      if (param.type === "string_current") {
                        const allStringCurrents = Array.from({ length: 24 }, (_, i) => 
                          smb[`string_current${i + 1}`] || 0
                        );
                        const maxCurrent = Math.max(...allStringCurrents);
                        const className = getDeviationClass(value, maxCurrent);
                        
                        return (
                          <td key={id} className={`smb-heatmap__data-cell ${className}`}>
                            {formatValue(value, param.type)}
                          </td>
                        );
                      }

                      // Temperature cells with color coding
                      if (param.type === "temperature") {
                        const className = getTemperatureClass(value);
                        return (
                          <td key={id} className={`smb-heatmap__data-cell ${className}`}>
                            {formatValue(value, param.type)}
                          </td>
                        );
                      }

                      // Regular numeric or text cells
                      return (
                        <td key={id} className="smb-heatmap__data-cell">
                          {formatValue(value, param.type)}
                        </td>
                      );
                    })}
                    <td className="smb-heatmap__unit-cell">{param.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMB_Heatmap;
