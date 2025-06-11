import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransformerScreen.css'; // Make sure to include CSS below in this file or your CSS file

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000");

const TransformerScreen = () => {
  const [transformerData, setTransformerData] = useState([]);
  const [error, setError] = useState(null);

  // Helper to parse numeric value from "42.00 °C"
  const getNumericValue = (str) => {
    if (!str) return 0;
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Fetch data from API and format
  const fetchData = async () => {
    try {
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/api/transformer`);
      const formattedData = res.data.map((item) => ({
        title: item.NAME,
        values: {
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

  // Inline SVG for half gauge
  const renderHalfGauge = (value, max, label, color) => {
    const percentage = Math.min(Math.max(value / max, 0), 1);
    const angle = percentage * 180;
    const radius = 60;
    const cx = 70;
    const cy = 70;
    // Calculate end point of arc
    const rad = Math.PI * (1 - percentage);
    const startX = cx - radius;
    const startY = cy;
    const endX = cx + radius * Math.cos(rad);
    const endY = cy - radius * Math.sin(rad);

    // Large arc flag for SVG path
    const largeArcFlag = angle > 90 ? 1 : 0;

    return (
      <svg width="140" height="80" viewBox="0 0 140 80" aria-label={`${label} gauge`}>
        {/* Background arc */}
        <path
          d="M10,70 A60,60 0 0,1 130,70"
          fill="none"
          stroke="#eee"
          strokeWidth="12"
        />
        {/* Value arc */}
        <path
          d={`M10,70 A60,60 0 ${largeArcFlag},1 ${endX},${endY}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value Text */}
        <text x="70" y="60" textAnchor="middle" fontSize="20" fill={color} fontWeight="bold">
          {value.toFixed(1)}
        </text>
        {/* Label */}
        <text x="70" y="78" textAnchor="middle" fontSize="12" fill="#333">
          {label}
        </text>
      </svg>
    );
  };

  return (
    <>
      {/* Background Image */}
      <div className="background-image"></div>

      <div className="transformer-container">
        {error && <div className="error-message">{error}</div>}
        {transformerData.length === 0 && !error && <div className="loading-message">Loading...</div>}

        {transformerData.map((transformer) => {
          const lv1Value = getNumericValue(transformer.values['LV1 Winding Temperature']);
          const oilValue = getNumericValue(transformer.values['Oil Temperature']);

          return (
            <div className="transformer-card" key={transformer.title}>
              <div className="gauges-wrapper">
                {renderHalfGauge(lv1Value, 150, 'LV1 Winding', '#128686')}
                {renderHalfGauge(oilValue, 150, 'Oil Temp', '#f39c12')}
              </div>

              <div className="card-header">{transformer.title}</div>

              <div className="card-table">
                <div className="table-header">
                  <span>PARAMETERS</span>
                  <span>VALUES</span>
                </div>
                {Object.entries(transformer.values).map(([label, value]) => (
                  <div className="table-row" key={label}>
                    <span>{label}</span>
                    <span>: {value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TransformerScreen;
