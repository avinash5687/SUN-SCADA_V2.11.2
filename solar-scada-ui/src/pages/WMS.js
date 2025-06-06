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
      console.log("Fetched Chart Data:", response.data);
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
              { name: "Timestamp", key: "Date_Time", unit: "" },
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
              { name: "Transmission Loss 2", key: "SOI_LS2", unit: "%" },
            ].map((param, idx) => (
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

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={zoomedData}
              onMouseDown={() => onZoomChange(true)}
              onMouseUp={() => onZoomChange(false)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Date_Time" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" domain={[0, 1600]} />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 8]} />
              <YAxis yAxisId="right2" orientation="right" stroke="#ff7300" domain={[0, 100]} />
              <YAxis yAxisId="right3" orientation="right" stroke="#6A5ACD" domain={[0, 20]} />
              <YAxis yAxisId="right4" orientation="right" stroke="#9370DB" domain={[0, 360]} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="GHI" stroke="#8884d8" name="GHI (W/m²)" />
              <Line yAxisId="left" type="monotone" dataKey="POA" stroke="#82ca9d" name="POA (W/m²)" />
              <Line yAxisId="left" type="monotone" dataKey="DHI" stroke="#1E90FF" name="DHI (W/m²)" />
              <Line yAxisId="right" type="monotone" dataKey="CUM_GHI" stroke="#FFD700" name="GHI Cumulative (kWh/m²)" />
              <Line yAxisId="right" type="monotone" dataKey="CUM_POA" stroke="#A0E7E5" name="POA Cumulative (kWh/m²)" />
              <Line yAxisId="right" type="monotone" dataKey="DHI_CUMM" stroke="#B19CD9" name="DHI Cumulative (kWh/m²)" />
              <Line yAxisId="right2" type="monotone" dataKey="MOD_TEMP1" stroke="#FF4500" name="Module Temperature 1 (°C)" />
              <Line yAxisId="right2" type="monotone" dataKey="MOD_TEMP2" stroke="#DA70D6" name="Module Temperature 2 (°C)" />
              <Line yAxisId="right2" type="monotone" dataKey="AMB_TEMP" stroke="#32CD32" name="Ambient Temperature (°C)" />
              <Line yAxisId="right2" type="monotone" dataKey="RH" stroke="#FFDAB9" name="Humidity (%)" />
              <Line yAxisId="right2" type="monotone" dataKey="SOI1" stroke="#556B2F" name="Soiling 1 (%)" />
              <Line yAxisId="right2" type="monotone" dataKey="SOI_LS1" stroke="#8B4513" name="Transmission Loss 1 (%)" />
              <Line yAxisId="right2" type="monotone" dataKey="SOI2" stroke="#2F4F4F" name="Soiling 2 (%)" />
              <Line yAxisId="right2" type="monotone" dataKey="SOI_LS2" stroke="#708090" name="Transmission Loss 2 (%)" />
              <Line yAxisId="right3" type="monotone" dataKey="WND_SPD" stroke="#6A5ACD" name="Wind Speed (m/s)" />
              <Line yAxisId="right4" type="monotone" dataKey="WND_DIR" stroke="#9370DB" name="Wind Direction (°)" />

              <Brush
                dataKey="Date_Time"
                height={20}
                stroke="#8884d8"
                onMouseDown={() => onZoomChange(true)}
                onMouseUp={() => onZoomChange(false)}
                onChange={handleBrushChange}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WMS;
