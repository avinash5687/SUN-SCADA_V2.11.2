import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import GaugeChart from 'react-gauge-chart';
import './TransformerScreen.css';
import { API_ENDPOINTS } from '../apiConfig';

const TransformerScreen = () => {
  const [transformerData, setTransformerData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef(null);

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    
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
          'LV1 Winding Temperature': item.LV1_WT != null ? `${item.LV1_WT.toFixed(1)}°C` : 'N/A',
          'LV2 Winding Temperature': item.LV2_WT != null ? `${item.LV2_WT.toFixed(1)}°C` : 'N/A',
          'HV Winding Temperature': item.HV_WT != null ? `${item.HV_WT.toFixed(1)}°C` : 'N/A',
          'Oil Temperature': item.OIL_TEMP != null ? `${item.OIL_TEMP.toFixed(1)}°C` : 'N/A'
        }
      }));
      setTransformerData(formattedData);
      dataRef.current = formattedData;
    } catch (error) {
      setError('Failed to fetch transformer data.');
      console.error('Error fetching transformer data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const getTemperatureStatus = (temp) => {
    if (temp >= 120) return 'CRITICAL';
    if (temp >= 90) return 'WARNING';
    if (temp >= 70) return 'NORMAL';
    return 'GOOD';
  };

  // Get needle color based on temperature value
  const getNeedleColor = (temp) => {
    if (temp >= 120) return '#e74c3c';  // Critical - Red
    if (temp >= 90) return '#f39c12';   // Warning - Orange
    if (temp >= 70) return '#3498db';   // Normal - Blue
    return '#2ecc71';                   // Good - Green
  };

  const renderCompactGauge = (value, label, min = 0, max = 150) => {
    const clampedValue = Math.max(min, Math.min(value, max));
    const status = getTemperatureStatus(value);
    const percentage = clampedValue / max;
    const needleColor = getNeedleColor(value);
    
    return (
      <div className="compact-gauge-container" key={label}>
        {/* Value Display - Above the gauge */}
        <div className="gauge-value-display">
          <span className="temperature-value">{clampedValue.toFixed(1)}°C</span>
        </div>
        
        {/* Gauge Chart - With dynamic needle color */}
        <div className="gauge-wrapper">
          <GaugeChart
            id={`gauge-${label.replace(/\s+/g, '-').toLowerCase()}`}
            nrOfLevels={4}
            percent={percentage}
            arcsLength={[0.33, 0.33, 0.17, 0.17]}
            colors={['#2ecc71', '#3498db', '#f39c12', '#e74c3c']}
            arcWidth={0.25}
            arcPadding={0.015}
            cornerRadius={2}
            needleColor={needleColor}
            needleBaseColor="#34495e"
            hideText={true}
            animate={true}
            animateDuration={600}
          />
        </div>
        
        {/* Label and Status - Below the gauge */}
        <div className="gauge-info">
          <div className="gauge-label">{label.replace(' Temperature', '')}</div>
          <div className={`status-badge ${status.toLowerCase()}`}>
            {status}
          </div>
        </div>
      </div>
    );
  };

  // Legend component
  const TemperatureLegend = () => (
    <div className="temperature-legend">
      <h4 className="legend-title">Temperature Status Legend</h4>
      <div className="legend-items">
        <div className="legend-item">
          <div className="legend-color good"></div>
          <span className="legend-text">Good (0-70°C)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color normal"></div>
          <span className="legend-text">Normal (70-90°C)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color warning"></div>
          <span className="legend-text">Warning (90-120°C)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color critical"></div>
          <span className="legend-text">Critical (above 120°C)</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="transformer-screen">
      {/* Page Header */}
      <div className="transformer-header">
        <h2 className="transformer-title">Transformer Monitoring</h2>
      </div>

      {/* Legend Section */}
      <div className="legend-section">
        <TemperatureLegend />
      </div>

      {/* Main Content */}
      <div className="transformer-content">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
            <button className="retry-btn" onClick={() => { setError(null); fetchData(true); }}>
              Retry
            </button>
          </div>
        )}

        {loading && !transformerData.length && (
          <div className="loading-container">
            <div className="loading-spinner large-loader"></div>
            <div className="loading-message">Loading transformer data...</div>
          </div>
        )}

        {transformerData.length > 0 && (
          <div className="compact-transformers-grid">
            {transformerData.map((transformer, index) => (
              <div className="compact-transformer-card" key={transformer.title}>
                {/* Compact Card Header */}
                <div className="compact-card-header">
                  <div className="header-content">
                    <div className="transformer-icon-badge">
                      <span className="transformer-icon">⚡</span>
                    </div>
                    <div className="title-info">
                      <h3 className="card-title">{transformer.title.replace(/_/g, ' ')}</h3>
                      <div className={`connection-status ${transformer.status === 1 ? 'online' : 'offline'}`}>
                        <div className="status-dot"></div>
                        {transformer.status === 1 ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compact Gauges Section */}
                <div className="compact-gauges-section">
                  <div className="compact-gauges-grid">
                    {Object.entries(transformer.values).map(([label, value]) =>
                      renderCompactGauge(value, label)
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && transformerData.length === 0 && (
          <div className="no-data-message">
            <div className="no-data-icon">🔌</div>
            <h3>No Transformers Found</h3>
            <p>No transformer data available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransformerScreen;
