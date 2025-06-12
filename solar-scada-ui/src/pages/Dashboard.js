import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DeviceStatusPopup from "../components/DeviceStatusPopup";
import KIPCard from "../components/KIPCard";
import { PieChart, Pie, Cell } from "recharts";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Brush } from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const [plantKPI, setPlantKPI] = useState({});
  const [currentPower, setCurrentPower] = useState(0);
  const [performanceRatio, setPerformanceRatio] = useState(0);
  const [plantAvailability, setPlantAvailability] = useState(0);
  const [gridAvailability, setGridAvailability] = useState(0);
  const [cuf, setCUF] = useState(0);
  const [barChartData, setBarChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [trendType, setTrendType] = useState("day");
  const [wmsData, setWMSData] = useState({});
  const [lastUpdated, setLastUpdated] = useState("");
  const [deviceStatus, setDeviceStatus] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const API_BASE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "http://103.102.234.177:5000";

  const fetchData = useCallback(async () => {
    try {
      const { data: plantData } = await axios.get(`${API_BASE_URL}/api/dashboard/plant-kpi?_=${Date.now()}`);
      const newKPI = plantData?.[0] || {};
      setPlantKPI((prev) => (JSON.stringify(prev) !== JSON.stringify(newKPI) ? newKPI : prev));
      setCurrentPower(newKPI.currentPower || 0);
      setPerformanceRatio(newKPI.PR || 0);
      setPlantAvailability(newKPI.PA || 0);
      setGridAvailability(newKPI.GA || 0);
      setCUF(newKPI.CUF || 0);

      const { data: lineData } = await axios.get(`${API_BASE_URL}/api/dashboard/line-chart`);
      setLineChartData((prev) => (JSON.stringify(prev) !== JSON.stringify(lineData) ? lineData : prev));

      const { data: wmsResponse } = await axios.get(`${API_BASE_URL}/api/dashboard/WMSDATA-DASH`);
      const newWMSData = wmsResponse?.[0] || {};
      setWMSData((prev) => (JSON.stringify(prev) !== JSON.stringify(newWMSData) ? newWMSData : prev));

      // ✅ Set lastUpdated from WMS tag
      if (newWMSData.Date_Time) {
        setLastUpdated(`Last Data updated on :  ${newWMSData.Date_Time}`);
      }

      const { data: deviceResponse } = await axios.get(`${API_BASE_URL}/api/dashboard/device-status`);
      setDeviceStatus(deviceResponse);
    } catch (error) {
      console.error("API Error:", error);
    }
  }, [API_BASE_URL]);

  const fetchBarChartData = useCallback(async () => {
    let apiUrl = `${API_BASE_URL}/api/dashboard/bar-chart`;

    if (trendType === "week") apiUrl = `${API_BASE_URL}/api/dashboard/bar-chart1`;
    else if (trendType === "month") apiUrl = `${API_BASE_URL}/api/dashboard/bar-chart2`;
    else if (trendType === "year") apiUrl = `${API_BASE_URL}/api/dashboard/bar-chart3`;

    try {
      const { data } = await axios.get(apiUrl, { params: { date: selectedDate } });
      setBarChartData(data);
    } catch (error) {
      console.error("API Error:", error);
    }
  }, [trendType, selectedDate, API_BASE_URL]);

  useEffect(() => {
    fetchData();
    fetchBarChartData();
    const intervalId = setInterval(() => {
      fetchData();
      fetchBarChartData();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchData, fetchBarChartData]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getGaugeRadii = (screenWidth) => {
    if (screenWidth <= 1280) return { innerRadius: 23, outerRadius: 40 };
    if (screenWidth <= 1440) return { innerRadius: 24, outerRadius: 44 };
    if (screenWidth <= 1920) return { innerRadius: 30, outerRadius: 54 };
    return { innerRadius: 30, outerRadius: 54 };
  };

  const renderGauge = (value, label) => {
    const { innerRadius, outerRadius } = getGaugeRadii(screenWidth);
    const segments = 20;
    const filledSegments = Math.round((value / 100) * segments);

    let fillColor = "#008000";
    if (value < 70) fillColor = "#dd112f";
    else if (value <= 80) fillColor = "#fbd202";

    const data = Array.from({ length: segments }, (_, index) => ({
      value: 1,
      color: index < filledSegments ? fillColor : "#e0e0e0",
    }));

    return (
      <div className="gauge-wrapper">
        <PieChart width={outerRadius * 2 + 20} height={outerRadius * 2}>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="gauge-center-text">{value}%</div>
      </div>
    );
  };

  const LineChartComponent = ({ data, onZoomChange }) => {
    const normalizedData = data.map(entry => ({
      ...entry,
      POA: entry.POA,
      ACTIVE_POWER: entry.ACTIVE_POWER,
    }));
  
    return (
      <div className="line-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={normalizedData}>
            <CartesianGrid strokeDasharray="5 5" />
            <XAxis dataKey="Date_Time" />
            
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#ff7300"
              domain={[0, 1200]}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#387908"
              domain={[0, 14000]}
            />
  
            <Tooltip />
            <Legend 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingBottom: 25 }} 
            />
  
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="POA"
              stroke="#ff7300"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ACTIVE_POWER"
              stroke="#387908"
              strokeWidth={2}
              dot={false}
            />
  
            <Brush
              dataKey="Date_Time"
              height={20}
              stroke="#8884d8"
              onMouseDown={() => onZoomChange?.(true)}
              onMouseUp={() => onZoomChange?.(false)}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
  


  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">Dashboard</div>
        <span className="last-updated">{lastUpdated}</span>
      </div>

      <div className="gauge-container">
        <div>
          <h6>Performance Ratio</h6>
          {/* <PRGauge value={performanceRatio} /> */}
          {renderGauge(performanceRatio)}

        </div>
        <div>
          <h6>Plant Availability</h6>
          {/* <PlantAvailabilityGauge value={plantAvailability} /> */}
          {renderGauge(plantAvailability)}
        </div>
        <div>
          <h6>Grid Availability</h6>
          {/* <GridAvailabilityGauge value={gridAvailability} /> */}
          {renderGauge(gridAvailability)}
        </div>
        <div>
          <h6>CUF (%)</h6>
          {/* <CUFGauge value={cuf} /> */}
          {renderGauge(cuf)}
        </div>
        <div>
          <h6>Active Power</h6>
          {/* <ActivePowerGauge value={currentPower} /> */}
          {renderGauge(currentPower)}
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <div className="chart-header">
            <h4 className="component-title">Energy Data</h4>
            <div className="chart-controls">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              <button onClick={() => setTrendType("day")}>Day</button>
              <button onClick={() => setTrendType("week")}>Week</button>
              <button onClick={() => setTrendType("month")}>Month</button>
              <button onClick={() => setTrendType("year")}>Year</button>
            </div>
          </div>
          <div className="bar-chart-container">
            <h6 className="generation-total">
              Total - Generation <span style={{ color: "red" }}>
                {barChartData.reduce((sum, item) => sum + (parseFloat(item["Energy Generated"]) || 0), 0).toFixed(2)}
              </span> MWh
            </h6>
            <div className="bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 5, left: 2, bottom: 1 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="TIME" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip />
                <Bar dataKey="Energy Generated" fill="#FF4500" barSize={15} />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="chart">
          <h4 className="component-title">Active Power & POA Trend</h4>
          <LineChartComponent data={lineChartData} />
        </div>
      </div>

      <div className="equipment-wms-container">
        <div className="equipment-status">
          <div className="equipment-status-header">
            <h4 className="component-title">Equipment Status</h4>
            <button className="open-popup-btn" onClick={() => setShowPopup(true)}>
              View Communication Status
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Total Count</th>
                <th>Running Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Inverter</td>
                <td className="center-align">4</td>
                <td className="center-align">{plantKPI.INV_CNT || 0}</td>
              </tr>
              <tr>
                <td>MFM</td>
                <td className="center-align">8</td>
                <td className="center-align">{plantKPI.MFM_CNT || 0}</td>
              </tr>
              <tr>
                <td>Transformer</td>
                <td className="center-align">2</td>
                <td className="center-align">{plantKPI.PLC_CNT || 0}</td>
              </tr>
              <tr>
                <td>WMS</td>
                <td className="center-align">1</td>
                <td className="center-align">{plantKPI.WMS_CNT || 0}</td>
              </tr>
            </tbody>
          </table>
          {showPopup && <DeviceStatusPopup data={deviceStatus} onClose={() => setShowPopup(false)} />}
        </div>

        <div className="wms-data">
          <h4 className="component-title">Weather Data</h4>
          <table>
            <thead>
              <tr>
                <th>Parameters</th>
                <th>Value</th>
                <th>Units</th>
                <th>Parameters</th>
                <th>Value</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>POA</td>
                <td className="center-align">{wmsData.POA1 || 0}</td>
                <td className="center-align">W/m²</td>
                <td>GHI</td>
                <td className="center-align">{wmsData.GHI || 0}</td>
                <td className="center-align">W/m²</td>
              </tr>
              <tr>
                <td>Cumulative POA</td>
                <td className="center-align">{wmsData.CUM_POA1 || 0}</td>
                <td className="center-align">kWh/m²</td>
                <td>Cumulative GHI</td>
                <td className="center-align">{wmsData.CUM_GHI || 0}</td>
                <td className="center-align">kWh/m²</td>
              </tr>
              <tr>
                <td>Module Temperature 1</td>
                <td className="center-align">{wmsData.MOD_TEMP1 || 0}</td>
                <td className="center-align">°C</td>
                <td>Module Temperature 2</td>
                <td className="center-align">{wmsData.MOD_TEMP2 || 0}</td>
                <td className="center-align">°C</td>
              </tr>
              <tr>
                <td>Ambient Temperature</td>
                <td className="center-align">{wmsData.AMB_TEMP || 0}</td>
                <td className="center-align">°C</td>
                <td>Rain</td>
                <td className="center-align">{wmsData.RAIN || 0}</td>
                <td className="center-align">mm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="kip-cards-container">
        <KIPCard title="Plant Export" value={plantKPI.P_EXP || 0} unit="kWh" />
        <KIPCard title="Plant Import" value={plantKPI.P_IMP || 0} unit="kWh" />
        <KIPCard title="Start Time" value={plantKPI.P_START || "00:00"} unit="Hrs" />
        <KIPCard title="Stop Time" value={plantKPI.P_STOP || "00:00"} unit="Hrs" />
        <KIPCard title="Running Time" value={plantKPI.P_RUN || "00:00"} unit="Hrs" />
        <KIPCard title="Grid Downtime" value={plantKPI.P_DOWN || "00:00"} unit="Hrs" />
      </div>
    </div>
  );
};

export default Dashboard;
