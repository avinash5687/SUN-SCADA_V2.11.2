import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransformerScreen.css';
import { API_ENDPOINTS } from '../apiConfig';

const TransformerScreen = () => {
  const [transformerData, setTransformerData] = useState([]);
  const [error, setError] = useState(null);

  const getNumericValue = (str) => {
    if (!str) return 0;
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  const fetchData = async () => {
    try {
      setError(null);
      const res = await axios.get(API_ENDPOINTS.transformer.getAll);
      const formattedData = res.data.map((item) => ({
        title: item.NAME,
        status: item.CUM_STS || 1,
        values: {
          'LV1 Winding Temperature': item.LV1_WT != null ? item.LV1_WT : 0,
          'LV2 Winding Temperature': item.LV2_WT != null ? item.LV2_WT : 0,
          'HV Winding Temperature': item.HV_WT != null ? item.HV_WT : 0,
          'Oil Temperature': item.OIL_TEMP != null ? item.OIL_TEMP : 0
        },
        rawValues: {
          'LV1 Winding Temperature': item.LV1_WT != null ? `${item.LV1_WT.toFixed(2)} °C` : 'N/A',
          'LV2 Winding Temperature': item.LV2_WT != null ? `${item.LV2_WT.toFixed(2)} °C` : 'N/A',
          'HV Winding Temperature': item.HV_WT != null ? `${item.HV_WT.toFixed(2)} °C` : 'N/A',
          'Oil Temperature': item.OIL_TEMP != null ? `${item.OIL_TEMP.toFixed(2)} °C` : 'N/A'
        }
      }));
      setTransformerData(formattedData);
    } catch (error) {
      setError('Failed to fetch transformer data.');
      console.error('Error fetching transformer data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTemperatureColor = (temp) => {
    if (temp >= 120) return '#e74c3c';
    if (temp >= 90) return '#f39c12';
    if (temp >= 70) return '#3498db';
    return '#27ae60';
  };

  const getTemperatureStatus = (temp) => {
    if (temp >= 120) return 'CRITICAL';
    if (temp >= 90) return 'WARNING';
    if (temp >= 70) return 'NORMAL';
    return 'GOOD';
  };

  const renderSimpleArcGauge = (value, max, label, min = 0) => {
    const clampedValue = Math.max(min, Math.min(value, max));
    const percentage = (clampedValue - min) / (max - min);
    const color = getTemperatureColor(value);
    const status = getTemperatureStatus(value);

    // Arc parameters for simple half circle
    const radius = 45;
    const centerX = 60;
    const centerY = 60;
    const strokeWidth = 8;
    const innerRadius = radius - strokeWidth / 2;
    
    // Calculate circumference and dash properties
    const circumference = innerRadius * Math.PI; // Half circle
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - percentage);

    return (
      <div className="simple-arc-container">
        <div className="simple-arc-wrapper">
          <svg width="120" height="80" viewBox="0 0 120 80">
            {/* Gradient definitions */}
            <defs>
              <linearGradient id={`simple-gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#27ae60" />
                <stop offset="33%" stopColor="#3498db" />
                <stop offset="66%" stopColor="#f39c12" />
                <stop offset="100%" stopColor="#e74c3c" />
              </linearGradient>
            </defs>

            {/* Background arc */}
            <path
              d={`M 15 60 A 45 45 0 0 1 105 60`}
              fill="none"
              stroke="#e9ecef"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Colored background segments */}
            <path
              d={`M 15 60 A 45 45 0 0 1 105 60`}
              fill="none"
              stroke={`url(#simple-gradient-${label})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Progress arc */}
            <path
              d={`M 15 60 A 45 45 0 0 1 105 60`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="progress-arc-simple"
              style={{
                filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))',
                transition: 'stroke-dashoffset 0.8s ease-in-out'
              }}
            />

            {/* Scale marks */}
            {[0, 25, 50, 75, 100].map((mark, index) => {
              const angle = (mark / 100) * Math.PI;
              const markRadius = radius - 3;
              const x = centerX + markRadius * Math.cos(Math.PI - angle);
              const y = centerY - markRadius * Math.sin(Math.PI - angle);
              const x2 = centerX + (markRadius + 6) * Math.cos(Math.PI - angle);
              const y2 = centerY - (markRadius + 6) * Math.sin(Math.PI - angle);
              
              return (
                <line
                  key={index}
                  x1={x}
                  y1={y}
                  x2={x2}
                  y2={y2}
                  stroke="#666"
                  strokeWidth="2"
                />
              );
            })}

            {/* Value marker - Simple triangle pointer */}
            {percentage > 0 && (() => {
              const angle = percentage * Math.PI;
              const markerRadius = radius + 10;
              const markerX = centerX + markerRadius * Math.cos(Math.PI - angle);
              const markerY = centerY - markerRadius * Math.sin(Math.PI - angle);
              
              return (
                <polygon
                  points={`${markerX},${markerY-5} ${markerX-4},${markerY+3} ${markerX+4},${markerY+3}`}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="1"
                  className="arc-marker-triangle"
                />
              );
            })()}

            {/* Scale labels */}
            <text x="15" y="75" textAnchor="middle" fontSize="9" fill="#666" fontWeight="600">{min}</text>
            <text x="105" y="75" textAnchor="middle" fontSize="9" fill="#666" fontWeight="600">{max}</text>

            {/* Digital display */}
            <rect x={centerX - 20} y="20" width="40" height="14" rx="7" fill="#2c3e50" opacity="0.95"/>
            <text 
              x={centerX} 
              y="30" 
              textAnchor="middle" 
              fontSize="10" 
              fill="#ffffff" 
              fontWeight="bold"
              fontFamily="monospace"
            >
              {clampedValue.toFixed(1)}°C
            </text>
          </svg>
        </div>
        
        <div className="simple-arc-info">
          <div className="simple-arc-label">{label}</div>
          <div className={`simple-status-badge ${status.toLowerCase()}`}>
            {status}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="transformer-screen">
      {/* MFM-Style Header */}
      <div className="mfm-style-header">
        <h2 className="mfm-style-title">Transformer Monitoring</h2>
      </div>

      {/* Main Content */}
      <div className="transformer-content">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
            <button className="retry-btn" onClick={fetchData}>Retry</button>
          </div>
        )}

        {transformerData.length === 0 && !error && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-message">Loading transformer data...</div>
          </div>
        )}

        <div className="transformers-grid">
          {transformerData.map((transformer, index) => (
            <div className="simple-transformer-card" key={transformer.title}>
              {/* Card Header */}
              <div className="simple-card-header">
                <div className="card-title">
                  <span className="transformer-icon">⚡</span>
                  {transformer.title.replace(/_/g, ' ')}
                </div>
                <div className={`connection-status ${transformer.status === 1 ? 'online' : 'offline'}`}>
                  <div className="status-dot"></div>
                  {transformer.status === 1 ? 'Online' : 'Offline'}
                </div>
              </div>

              {/* Simple Arc Gauges Section */}
              <div className="simple-arc-gauges-section">
                <div className="simple-arc-gauges-grid">
                  {renderSimpleArcGauge(transformer.values['LV1 Winding Temperature'], 150, 'LV1 Winding', 0)}
                  {renderSimpleArcGauge(transformer.values['LV2 Winding Temperature'], 150, 'LV2 Winding', 0)}
                  {renderSimpleArcGauge(transformer.values['HV Winding Temperature'], 150, 'HV Winding', 0)}
                  {renderSimpleArcGauge(transformer.values['Oil Temperature'], 150, 'Oil Temp', 0)}
                </div>
              </div>

              {/* Data Table */}
              <div className="simple-data-section">
                <div className="data-grid">
                  {Object.entries(transformer.rawValues).map(([label, value]) => (
                    <div className="simple-data-item" key={label}>
                      <span className="simple-data-label">{label.replace(' Temperature', '')}</span>
                      <span className="simple-data-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransformerScreen;
