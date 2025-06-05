import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  CartesianGrid
} from "recharts";
import "./WMS.css";

const WMS = () => {
  const [wmsData, setWmsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [zoomedData, setZoomedData] = useState([]);
  const [isZooming, setIsZooming] = useState(false);

  // ✅ Zoom control handler
  const onZoomChange = (zooming) => {
    setIsZooming(zooming);
  };

  const fetchWMSData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wms");
      setWmsData(response.data);
    } catch (error) {
      console.error("Error fetching WMS data:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/wms/WMS-CHART");
      setChartData(response.data);
      setZoomedData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    fetchWMSData();
    fetchChartData();

    const interval = setInterval(() => {
      if (!isZooming) {
        fetchWMSData();
        fetchChartData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isZooming]);

  const handleBrushChange = (range) => {
    if (!range) return;
    const { startIndex, endIndex } = range;
    if (startIndex !== undefined && endIndex !== undefined) {
      const sliced = chartData.slice(startIndex, endIndex + 1);
      setZoomedData(sliced);
    }
  };

  return (
    <div className="wms-container">
      <h2 className="wms-title">WMS Data</h2>

      <div className="wms-content">
        <table className="wms-table">
          <thead>
            <tr>
              <th>Parameters</th>
              {wmsData.map((sensor, index) => (
                <th key={index}>{sensor.ICR || `Sensor ${index + 1}`}</th>
              ))}
              <th>UNIT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Communication Status</td>
              {wmsData.map((sensor, index) => (
                <td key={index} className="status-cell">
                  <div className={`status-indicator ${sensor.CUM_STS === 1 ? "status-green" : "status-red"}`}></div>
                </td>
              ))}
              <td></td>
            </tr>

            {[
              { name: "GHI", key: "GHI", unit: "W/m²" },
              { name: "GHI Cumulative", key: "CUM_GHI", unit: "kWh/m²" },
              { name: "POA", key: "POA1", unit: "W/m²" },
              { name: "POA Cumulative", key: "CUM_POA1", unit: "kWh/m²" },
              { name: "DHI", key: "DHI", unit: "W/m²" },
              { name: "DHI Cumulative", key: "DHI_CUMM", unit: "kWh/m²" },
              { name: "Module Temperature 1", key: "MOD_TEMP1", unit: "°C" },
              { name: "Module Temperature 2", key: "MOD_TEMP2", unit: "°C" },
              { name: "Ambient Temperature", key: "AMB_TEMP", unit: "°C" },
              { name: "Humidity", key: "RH", unit: "%" },
              { name: "Wind Speed", key: "WND_SPD", unit: "m/s" },
              { name: "Wind Direction", key: "WND_DIR", unit: "°" },
              { name: "Rainfall", key: "RAIN", unit: "mm" },
              { name: "Soiling 1", key: "SOI1", unit: "%" },
              { name: "Transmission Loss 1", key: "SOI_LS1", unit: "%" },
              { name: "Soiling 2", key: "SOI2", unit: "%" },
              { name: "Transmission Loss 2", key: "SOI_LS1", unit: "%" },
            ].map((param, idx)  => (
              <tr key={idx}>
                <td>{param.name}</td>
                {wmsData.map((sensor, index) => (
                  <td key={index}>{sensor[param.key] || 0}</td>
                ))}
                <td>{param.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ Line Chart with Zoom Brush */}
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={zoomedData}
              onMouseDown={() => onZoomChange(true)}
              onMouseUp={() => onZoomChange(false)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date_Time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ICR1_GHI" stroke="#8884d8" name="GHI (W/m²)" />
              <Line type="monotone" dataKey="ICR1_POA1" stroke="#82ca9d" name="POA-1 (W/m²)" />
              <Line type="monotone" dataKey="ICR1_POA2" stroke="#1E90FF" name="POA-2 (W/m²)" />
              <Line type="monotone" dataKey="ICR1_MOD_TEMP" stroke="#ff7300" name="Module Temp (°C)" />
              <Line type="monotone" dataKey="ICR1_AMB_TEMP" stroke="#2E8B57" name="Ambient Temp (°C)" />

              {/* ✅ Your requested code here */}
              <Brush
                dataKey="Date_Time"
                height={20}
                stroke="#8884d8"
                onMouseDown={() => onZoomChange(true)}  // ✅ works now
                onMouseUp={() => onZoomChange(false)}   // ✅ works now
                onChange={handleBrushChange}            // ✅ zoom effect
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WMS;
