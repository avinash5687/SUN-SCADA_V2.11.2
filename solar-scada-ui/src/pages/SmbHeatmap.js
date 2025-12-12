import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./SmbHeatmap.css";
import { API_ENDPOINTS } from "../apiConfig";

const SMB_Heatmap = () => {
  const [smbData, setSmbData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  // Refs to prevent flickering
  const initialLoadRef = useRef(false);
  const prevSmbDataRef = useRef({});

  const currentDb = localStorage.getItem("selectedDatabase") || "db1";
  const smbCount = currentDb === "db1" ? 34 : 12;
  const smbsPerPage = 12;
  const totalPages = Math.ceil(smbCount / smbsPerPage);
  const showPagination = totalPages > 1;

  const allSmbIds = Array.from({ length: smbCount }, (_, i) => i + 1);
  const smbIds = allSmbIds.slice(page * smbsPerPage, page * smbsPerPage + smbsPerPage);

  // Fetch SMB data with flickering prevention
  const fetchSmbData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await axios.get(API_ENDPOINTS.smb.getAll, { timeout: 10000 });
      if (Array.isArray(response.data) && response.data.length > 0) {
        const newSmbData = {};
        allSmbIds.forEach((id) => {
          const smb = response.data.find((item) => item.device_id === id);
          newSmbData[id] = smb || null;
        });

        const hasChanged = JSON.stringify(prevSmbDataRef.current) !== JSON.stringify(newSmbData);
        if (hasChanged || !initialLoadRef.current) {
          requestAnimationFrame(() => {
            setSmbData(newSmbData);
            prevSmbDataRef.current = newSmbData;
            initialLoadRef.current = true;
          });
        }
      } else {
        console.warn("No SMB data received");
      }
      if (!isRefresh) setLoading(false);
    } catch (error) {
      console.error("Error fetching SMB data:", error);
      if (!isRefresh) setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, [allSmbIds]);

  useEffect(() => {
    fetchSmbData(false);
    const interval = setInterval(() => fetchSmbData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchSmbData]);

  // Parameters
  const parameters = [
    { name: "Timestamp", key: "date_time", unit: "" },
    ...Array.from({ length: 16 }, (_, i) => ({
      name: `STR CRNT ${i + 1}`,
      key: `string_current${i + 1}`,
      unit: "A",
    })),
    { name: "TOT CRNT", key: "total_current", unit: "A" },
    { name: "DC Voltage", key: "voltage", unit: "V" },
    { name: "Power", key: "power", unit: "KW" },
  ];

  const getDeviationClass = (value, max) => {
    if (!value || !max || max === 0) return "";
    const deviationPercent = ((max - value) / max) * 100;
    if (deviationPercent <= 25) return "excellent";
    if (deviationPercent <= 50) return "good";
    if (deviationPercent <= 75) return "warning";
    return "critical";
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
            <span className="smb-heatmap__dot green"></span> Excellent (0–25%)
          </span>
          <span className="smb-heatmap__legend-item">
            <span className="smb-heatmap__dot yellow"></span> Good (25–50%)
          </span>
          <span className="smb-heatmap__legend-item">
            <span className="smb-heatmap__dot orange"></span> Warning (50–75%)
          </span>
          <span className="smb-heatmap__legend-item">
            <span className="smb-heatmap__dot red"></span> Critical (75%+)
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
                  <th>Parameters</th>
                  {smbIds.map((id) => (
                    <th key={id}>{smbData[id]?.name || `SMB-${id}`}</th>
                  ))}
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param, idx) => (
                  <tr key={idx}>
                    <td>{param.name}</td>
                    {smbIds.map((id) => {
                      const smb = smbData[id];
                      if (!smb) return <td key={id} className="smb-heatmap__no-data-cell">No Data</td>;

                      const value = smb[param.key];
                      if (param.key.startsWith("string_current")) {
                        const maxCurrent = Math.max(
                          ...Array.from({ length: 24 }, (_, i) => smb[`string_current${i + 1}`] || 0)
                        );
                        const className = getDeviationClass(value, maxCurrent);
                        return <td key={id} className={`smb-heatmap__deviation-cell ${className}`}>{value ?? "No Data"}</td>;
                      }
                      return <td key={id}>{value ?? "No Data"}</td>;
                    })}
                    <td>{param.unit}</td>
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