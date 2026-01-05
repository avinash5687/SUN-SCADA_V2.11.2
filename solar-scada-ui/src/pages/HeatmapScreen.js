import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";
import "./HeatmapScreen.css";

const heatmapCategories = [
  { key: "TotalEnergy", deviationKey: "DeviationPercentage", label: "Daily Energy", unit: "kWh" },
  { key: "AC_PWR", deviationKey: "Dev_PerAC", label: "Active Power", unit: "kW" },
  { key: "SPC_YLD", deviationKey: "Dev_Per_SPC_YLD", label: "Specific Yield", unit: "kWh/kWp" },
  { key: "PR", deviationKey: "Dev_Per_PR", label: "Performance\nRatio", unit: "%" },
];

const getStatus = (deviation) => {
  if (deviation < 25) return { text: "Excellent", color: "#27ae60", emoji: "🟢" };
  if (deviation < 50) return { text: "Good", color: "#f1c40f", emoji: "🟡" };
  if (deviation < 75) return { text: "Warning", color: "#f39c12", emoji: "🟠" };
  return { text: "Critical", color: "#e74c3c", emoji: "🔴" };
};

const getColor = deviation => {
  if (deviation < 25) return "rgba(39,174,96,0.87)";
  if (deviation < 50) return "rgba(241,196,15,0.85)";
  if (deviation < 75) return "rgba(243,156,18,0.86)";
  return "rgba(231,76,60,0.82)";
};

const Legend = () => {
  const legendData = [
    { color: "rgba(39,174,96,0.87)", label: "0-25% Excellent", emoji: "🟢" },
    { color: "rgba(241,196,15,0.85)", label: "25-50% Good", emoji: "🟡" },
    { color: "rgba(243,156,18,0.86)", label: "50-75% Warning", emoji: "🟠" },
    { color: "rgba(231,76,60,0.82)", label: "75%+ Critical", emoji: "🔴" }
  ];
  
  return (
    <div className="legend-container">
      <span className="legend-title">Deviation Legend:</span>
      {legendData.map((item, i) => (
        <span key={i} className="legend-item">
          <span className="legend-emoji" style={{ background: item.color }}>
            {item.emoji}
          </span>
          <span className="legend-text">{item.label}</span>
        </span>
      ))}
    </div>
  );
};

const HeatmapScreen = () => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupContent, setPopupContent] = useState({});
  const [inverterData, setInverterData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCell, setActiveCell] = useState(null);

  // FIXED: Single API call that returns all inverter data
  const fetchInverterData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const API_TIMEOUT = 10000;
      const timestamp = Date.now();

      console.log('🚀 Fetching heatmap data from single API...');

      // Single API call - no ID parameter needed since it returns all inverters
      const response = await axios.get(API_ENDPOINTS.inverter.heatmap, { 
        timeout: API_TIMEOUT,
        params: { _t: timestamp }
      });

      console.log('✅ Raw API Response:', response.data);

      // Process the array response - each object represents one inverter
      const allInverters = Array.isArray(response.data) ? response.data : [];
      console.log('📊 Processed inverters array:', allInverters);

      // Convert array to object with ID as key for easy access
      const newInverterData = {};
      allInverters.forEach(inverter => {
        if (inverter && inverter.ID) {
          newInverterData[inverter.ID] = inverter;
          console.log(`✅ Stored Inverter ${inverter.ID}:`, {
            ID: inverter.ID,
            Name: inverter.Inverter_Name,
            TotalEnergy: inverter.TotalEnergy,
            AC_PWR: inverter.AC_PWR,
            DeviationPercentage: inverter.DeviationPercentage
          });
        }
      });

      console.log('🗂️ Final inverter data structure:', newInverterData);

      // Update state with all inverter data
      setInverterData(newInverterData);
      setLoading(false);

      console.log('🎉 Heatmap data loaded successfully');

    } catch (error) {
      console.error("💥 Error fetching heatmap data:", error);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInverterData(false);
    const intervalId = setInterval(() => fetchInverterData(true), 30000);
    return () => clearInterval(intervalId);
  }, [fetchInverterData]);

  const handleCellClick = (event, item, category) => {
    event.stopPropagation();
    
    const deviation = Number(item[category.deviationKey]) || 0;
    const currentValue = Number(item[category.key]) || 0;
    const allData = Object.values(inverterData).filter(Boolean);
    const maxValue = Math.max(...allData.map(d => Number(d[category.key]) || 0));
    const status = getStatus(deviation);
    
    setActiveCell(`${item.ID}-${category.key}`);
    setPopupContent({ 
      status, 
      device: item.Inverter_Name || `Inverter ${item.ID}`, 
      current: currentValue.toFixed(2), 
      max: maxValue.toFixed(2), 
      deviation: deviation.toFixed(1), 
      unit: category.unit, 
      label: category.label 
    });
    
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setActiveCell(null);
  };

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('popup-overlay')) {
      closePopup();
    }
  };

  // Handle ESC key to close popup
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && popupVisible) {
        closePopup();
      }
    };

    if (popupVisible) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [popupVisible]);

  // Skeleton Components
  const SkeletonCell = () => (
    <div className="skeleton-cell">
      <div className="skeleton-cell-content">
        <div className="skeleton-value"></div>
        <div className="skeleton-label"></div>
      </div>
    </div>
  );

  // Get available inverter IDs from data (1,2,3,4)
  const availableIds = Object.keys(inverterData).map(id => parseInt(id)).sort();
  const inverterIds = availableIds.length > 0 ? availableIds : [1, 2, 3, 4];

  console.log('🖥️ Available inverter IDs:', availableIds);
  console.log('🖥️ Current inverter data keys:', Object.keys(inverterData));

  return (
    <div className="heatmap-container">
      {/* Formula Screen Style Header */}
      <div className="heatmap-header">
        <h2 className="heatmap-title">Performance Heatmap</h2>
        {refreshing && (
          <div className="refresh-indicator">
            <div className="refresh-spinner"></div>
            <span>Refreshing...</span>
          </div>
        )}
        <Legend />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="heatmap-loading">
          <div className="loading-spinner"></div>
          <span>Loading heatmap data...</span>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="heatmap-content">
          {heatmapCategories.map((category) => (
            <div key={category.key} className="heatmap-row">
              <div className="category-header">
                {category.label.split("\n").map((line, i) => (
                  <span key={i} className="category-title">{line}</span>
                ))}
                <span className="category-unit">{category.unit}</span>
              </div>
              <div 
                className="heatmap-cells" 
                style={{ gridTemplateColumns: `repeat(${inverterIds.length}, minmax(120px, 1fr))` }}
              >
                {inverterIds.map((id) => {
                  const item = inverterData[id];

                  console.log(`🔍 Rendering cell for Inverter ${id}:`, { hasItem: !!item, item });

                  if (!item) {
                    return (
                      <div 
                        key={`no-data-${id}-${category.key}`}
                        className="heatmap-cell no-data-cell"
                      >
                        <span className="cell-value">No Data</span>
                        <span className="cell-label">INV-{id}</span>
                      </div>
                    );
                  }

                  const deviation = Number(item[category.deviationKey]) || 0;
                  const cellValue = Number(item[category.key]) || 0;
                  
                  // Extract cleaner inverter label
                  let inverterLabel = `INVERTER-${id}`;
                  if (item.Inverter_Name) {
                    if (item.Inverter_Name.includes("_")) {
                      // Replace "_" with " " to show "ICR-1 INVERTER-1"
                      inverterLabel = item.Inverter_Name.replace("_", " ");
                    } else {
                      inverterLabel = item.Inverter_Name;
                    }
                  }
                  
                  console.log(`📊 Cell data for INV-${id}:`, { 
                    cellValue, 
                    deviation, 
                    inverterLabel,
                    rawName: item.Inverter_Name
                  });
                  
                  return (
                    <div 
                      key={`${item.ID}-${category.key}`} 
                      className={`heatmap-cell ${activeCell === `${item.ID}-${category.key}` ? 'active' : ''}`}
                      style={{ backgroundColor: getColor(deviation) }}
                      onClick={(e) => handleCellClick(e, item, category)}
                    >
                      <span className="cell-value">
                        {cellValue.toLocaleString()}
                      </span>
                      <span className="cell-label">{inverterLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup */}
      {popupVisible && (
        <div className="popup-overlay" onClick={handleOverlayClick}>
          <div className="heatmap-popup">
            <button className="popup-close" onClick={closePopup}>×</button>
            <div className="popup-content">
              <div 
                className="popup-status" 
                style={{ color: popupContent.status?.color }}
              >
                {popupContent.status?.emoji} {popupContent.status?.text}
              </div>
              <div className="popup-info">
                <div className="popup-row">
                  <strong>Device:</strong> 
                  <span>{popupContent.device}</span>
                </div>
                <div className="popup-row">
                  <strong>{popupContent.label?.replace("\n", " ")}:</strong> 
                  <span>{popupContent.current} {popupContent.unit}</span>
                </div>
                <div className="popup-row">
                  <strong>Deviation:</strong> 
                  <span style={{ color: popupContent.status?.color }}>
                    {popupContent.deviation}%
                  </span>
                </div>
              </div>
              <hr className="popup-divider" />
              <div className="popup-best">
                <strong>Best Performance:</strong> {popupContent.max} {popupContent.unit}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeatmapScreen;
