import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransformerScreen.css';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000");

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

  const renderHalfGauge = (value, max, label) => {
    const clampedValue = Math.max(0, Math.min(value, max));
    const percentage = clampedValue / max;
    const angle = percentage * 180;

    const radius = 45;
    const cx = 60;
    const cy = 60;

    const rad = Math.PI * (1 - percentage);
    const endX = cx + radius * Math.cos(rad);
    const endY = cy - radius * Math.sin(rad);
    const largeArcFlag = angle > 90 ? 1 : 0;

    const needleLength = radius - 8;
    const needleX = cx + needleLength * Math.cos(rad);
    const needleY = cy - needleLength * Math.sin(rad);

    const arcColor = clampedValue <= 90 ? '#2ecc71' : '#e74c3c';

    return (
      <div style={{ marginBottom: '5px' }}>
        <svg width="120" height="90" viewBox="0 0 120 90" aria-label={`${label} gauge`}>
          {/* Background Arc */}
          <path
            d={`M${cx - radius},${cy} A${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
            fill="none"
            stroke="#eee"
            strokeWidth="10"
          />

          {/* Value Arc */}
          <path
            d={`M${cx - radius},${cy} A${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY}`}
            fill="none"
            stroke={arcColor}
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={arcColor}
            strokeWidth="2"
          />
          <circle cx={cx} cy={cy} r="3" fill={arcColor} />

          {/* Value */}
          <text x={cx} y={cy - 10} textAnchor="middle" fontSize="14" fill="#000" fontWeight="bold">
            {clampedValue.toFixed(1)}
          </text>

          {/* Label */}
          <text x={cx} y={cy + 25} textAnchor="middle" fontSize="11" fill="#333" fontWeight="500">
            {label}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <>
      <div className="background-image"></div>
      <div className="transformer-container">
        {error && <div className="error-message">{error}</div>}
        {transformerData.length === 0 && !error && <div className="loading-message">Loading...</div>}

        {transformerData.map((transformer) => {
          const lv1Value = getNumericValue(transformer.values['LV1 Winding Temperature']);
          const lv2Value = getNumericValue(transformer.values['LV2 Winding Temperature']);
          const hvValue = getNumericValue(transformer.values['HV Winding Temperature']);
          const oilValue = getNumericValue(transformer.values['Oil Temperature']);

          return (
            <div className="transformer-card" key={transformer.title}>
              <div className="gauges-wrapper">
                {renderHalfGauge(lv1Value, 150, 'LV1 Winding')}
                {renderHalfGauge(oilValue, 150, 'Oil Temp')}
                {renderHalfGauge(lv2Value, 150, 'LV2 Winding')}
                {renderHalfGauge(hvValue, 150, 'HV Winding')}
              </div>

              <div className="card-header">{transformer.title.replace(/_/g, ' ')}</div>

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
