import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PRGauge from "../components/PRGauge";
import PlantAvailabilityGauge from "../components/PlantAvailabilityGauge";
import GridAvailabilityGauge from "../components/GridAvailabilityGauge";
import BarChartComponent from "../components/BarChartComponent";
import LineChartComponent from "../components/LineChartComponent";
import CUFGauge from "../components/CUFGauge";
import ActivePowerGauge from "../components/ActivePowerGauge";
import DeviceStatusPopup from "../components/DeviceStatusPopup";
import KIPCard from "../components/KIPCard";
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
  const [trendType, setTrendType] = useState("day"); // Default Daily Trend
  const [wmsData, setWMSData] = useState({});
  const [deviceStatus, setDeviceStatus] = useState([]); // Stores device communication data
  const [showPopup, setShowPopup] = useState(false); // Controls popup visibility

  // Fetch KPI Data
  const fetchData = useCallback(async () => {
    try {
      // Fetch Plant KPI
      const { data: plantData } = await axios.get(`http://localhost:5000/api/dashboard/plant-kpi?_=${Date.now()}`);
      const newKPI = plantData?.[0] || {};

      setPlantKPI((prev) => (JSON.stringify(prev) !== JSON.stringify(newKPI) ? newKPI : prev));
      setCurrentPower(newKPI.currentPower || 0);
      setPerformanceRatio(newKPI.PR || 0);
      setPlantAvailability(newKPI.PA || 0);
      setGridAvailability(newKPI.GA || 0);
      setCUF(newKPI.CUF || 0);

      // Fetch Line Chart Data
      const { data: lineData } = await axios.get("http://localhost:5000/api/dashboard/line-chart");
      setLineChartData((prev) => (JSON.stringify(prev) !== JSON.stringify(lineData) ? lineData : prev));

      // Fetch WMS Data
      const { data: wmsResponse } = await axios.get("http://localhost:5000/api/dashboard/WMSDATA-DASH");
      const newWMSData = wmsResponse?.[0] || {}; // Assuming the response is an array

      setWMSData((prev) => (JSON.stringify(prev) !== JSON.stringify(newWMSData) ? newWMSData : prev));

      // Fetch Device Communication Status Data
      const { data: deviceResponse } = await axios.get("http://localhost:5000/api/dashboard/device-status");
      setDeviceStatus(deviceResponse); // Store device status data
    } catch (error) {
      console.error("API Error:", error);
    }
  }, []);

  // Fetch Bar Chart Data Based on Trend Type
  const fetchBarChartData = useCallback(async () => {
    let apiUrl = "http://localhost:5000/api/dashboard/bar-chart"; // Default API for Day

    if (trendType === "week") apiUrl = "http://localhost:5000/api/dashboard/bar-chart1";
    else if (trendType === "month") apiUrl = "http://localhost:5000/api/dashboard/bar-chart2";
    else if (trendType === "year") apiUrl = "http://localhost:5000/api/dashboard/bar-chart3";

    try {
      const { data } = await axios.get(apiUrl, { params: { date: selectedDate } });
      setBarChartData(data);
    } catch (error) {
      console.error("API Error:", error);
    }
  }, [trendType, selectedDate]);

  // Fetch Data Intervals
  useEffect(() => {
    // Fetch data immediately
    fetchData();
    fetchBarChartData();
  
    // Set interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchData();
      fetchBarChartData();
    }, 30000); // 30000 milliseconds = 30 seconds
  
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchData, fetchBarChartData]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="gauge-container">
        <div>
          <h6>Performance Ratio</h6>
          <PRGauge value={performanceRatio} />
        </div>
        <div>
          <h6>Plant Availability</h6>
          <PlantAvailabilityGauge value={plantAvailability} />
        </div>
        <div>
          <h6>Grid Availability</h6>
          <GridAvailabilityGauge value={gridAvailability} />
        </div>
        <div>
          <h6>CUF (%)</h6>
          <CUFGauge value={cuf} />
        </div>
        <div>
          <h6 style={{ marginLeft: 40 }}>Active Power</h6>
          <ActivePowerGauge value={currentPower} />
        </div>
      </div>

      <div className="charts-container">
        {/* Bar Chart */}
        <div className="chart">
          <div className="chart-header">
            <h4 className="component-title">Energy Data</h4>
            <div className="chart-controls">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button onClick={() => setTrendType("day")}>Day</button>
              <button onClick={() => setTrendType("week")}>Week</button>
              <button onClick={() => setTrendType("month")}>Month</button>
              <button onClick={() => setTrendType("year")}>Year</button>
            </div>
          </div>
          <BarChartComponent data={barChartData} />
        </div>

        {/* Line Chart */}
        <div className="chart">
          <h4 className="component-title">Active Power & POA Trend</h4>
          <LineChartComponent data={lineChartData} />
        </div>
      </div>

      <div className="equipment-wms-container">
        {/* Equipment Status Table */}
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

        {/* WMS Data Table */}
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
        <td>POA-1</td>
        <td className="center-align">{wmsData.POA1 || 0}</td>
        <td className="center-align">W/m²</td>
        <td>GHI</td>
        <td className="center-align">{wmsData.GHI || 0}</td>
        <td className="center-align">W/m²</td>
      </tr>
      <tr>
        <td>CUM-POA-1</td>
        <td className="center-align">{wmsData.CUM_POA1 || 0}</td>
        <td className="center-align">kWh/m²</td>
        <td>CUM-GHI</td>
        <td className="center-align">{wmsData.CUM_GHI || 0}</td>
        <td className="center-align">kWh/m²</td>
      </tr>
      <tr>
        <td>POA-2</td>
        <td className="center-align">{wmsData.POA2 || 0}</td>
        <td className="center-align">W/m²</td>
        <td>Module Temp</td>
        <td className="center-align">{wmsData.MOD_TEMP || 0}</td>
        <td className="center-align">°C</td>
      </tr>
      <tr>
        <td>CUM-POA-2</td>
        <td className="center-align">{wmsData.CUM_POA2 || 0}</td>
        <td className="center-align">kWh/m²</td>
        <td>Ambient Temp</td>
        <td className="center-align">{wmsData.AMB_TEMP || 0}</td>
        <td className="center-align">°C</td>
      </tr>
    </tbody>
  </table>
</div>

      </div>

      {/* ✅ At the Bottom: KIP Cards */}
      <div className="kip-cards-container">
        <KIPCard title="Plant Export" value={plantKPI.P_EXP || 0} unit="kWh" />
        <KIPCard title="Plant Import" value={plantKPI.P_IMP || 0} unit="kWh" />
        {/* <KIPCard title="POA" value={plantKPI.poa || 0} unit="kWh/m²" />
        <KIPCard title="GHI" value={plantKPI.ghi || 0} unit="kWh/m²" /> */}
        <KIPCard title="Start Time" value={plantKPI.P_START || "00:00"} unit="Hrs" />
        <KIPCard title="Stop Time" value={plantKPI.P_STOP || "00:00"} unit="Hrs" />
        <KIPCard title="Running Time" value={plantKPI.P_RUN || "00:00"} unit="Hrs" />
        <KIPCard title="Downtime" value={plantKPI.P_DOWN || "00:00"} unit="Hrs" />
      </div>
    </div>
  );
};

export default Dashboard;