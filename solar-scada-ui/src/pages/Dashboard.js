import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import DeviceStatusPopup from "../components/DeviceStatusPopup";
import KIPCard from "../components/KIPCard";
import { PieChart, Pie, Cell } from "recharts";
import "./Dashboard.css";
import CylinderChart from "../components/CylinderChart";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Highcharts3D.default(Highcharts); 

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
  const chartRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000" : "http://103.102.234.177:5000";

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

      console.log("Line chart data:", lineChartData);

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
    }, 60000);
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

  const renderGauge = (value, label, max = 100, displayType = "percent") => {
    const { innerRadius, outerRadius } = getGaugeRadii(screenWidth);
    const segments = 20;
    const filledSegments = Math.round((value / max) * segments);

    let fillColor = "#008000";
    if ((value / max) * 100 < 70) fillColor = "#dd112f";
    else if ((value / max) * 100 <= 80) fillColor = "#fbd202";

    const data = Array.from({ length: segments }, (_, index) => ({
      value: 1,
      color: index < filledSegments ? fillColor : "#e0e0e0",
    }));

    // Decide what to display in the center
    let centerText = "";
    if (displayType === "value") {
      centerText = Number(value).toFixed(1).replace(/\.00$/, "");
    } else {
    const percentValue = (value / max) * 100;
    centerText = percentValue === 100 ? "100"
      : percentValue.toFixed(1).replace(/\.0$/, "");
    }

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
        <div className="gauge-center-text">
          {centerText}
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSpacingForWidth = (width) => {
    if (width <= 1229) return [10, 2, 14, 0];
    else if (width <= 1240) return [8, 6, 22, 0];
    else if (width <= 1280) return [5, 6, 14, 0];
    else if (width <= 1396) return [8, 4, 16, 0];
    else if (width <= 1440) return [10, 10, 10, 0];
    else if (width <= 1536) return [8, 8, 12, 0];
    else if (width <= 1707) return [14, 14, 10, 0];
    else if (width <= 1920) return [16, 16, 10, 0];
    else return [18, 10, 10, 0];
  };

  const getHeightForWidth = (width) => {
    if (width <= 1229) return 150;
    else if (width <= 1240) return 160;
    else if (width <= 1280) return 150;
    else if (width <= 1396) return 160;
    else if (width <= 1440) return 170;
    else if (width <= 1536) return 170;
    else if (width <= 1707) return 220
    else if (width <= 1920) return 220;
    else return 250;
  };

  const spacing = getSpacingForWidth(windowWidth);
  const height = getHeightForWidth(windowWidth);

  const getLineChartOptions = (data, height, spacing, onZoomChange) => {

    const poaSeries = data.map(d => d.POA);
    const activePowerSeries = data.map(d => d.ACTIVE_POWER);
    const categories = data.map(d => d.Date_Time);

    // ✅ Define these before using them
    const maxPOA = Math.max(...poaSeries, 0); 
    const maxActivePower = Math.max(...activePowerSeries, 0);

    return {
      chart: {
        type: 'line',
        zoomType: 'x',
        height: height,
        spacing: spacing,
        animation: { duration: 1200 },
        events: {
          selection: function(event) {
            // onZoomChange?.(!!event.xAxis);
          }
        }
      },
      title: { text: '' },
      xAxis: {
        type: 'datetime',
       categories: categories
      },
      yAxis: [
        {
          title: { text: 'POA' },
          opposite: false,
          lineColor: '#ff7300',
          lineWidth: 2,
          labels: { style: { color: '#ff7300' } },
          min: 0,
          max: Math.ceil(maxPOA * 1.1)  // Add 10% buffer
        },
        {
          title: { text: 'ACTIVE_POWER' },
          opposite: true,
          lineColor: '#387908',
          lineWidth: 2,
          labels: { style: { color: '#387908' } },
          min: 0,
          max: Math.ceil(maxActivePower * 1.1)  // Add 10% buffer
        }
      ],
      legend: { align: 'center', verticalAlign: 'bottom', y: 20 },
      tooltip: { shared: true, crosshairs: true },
      series: [
        { name: 'POA', data: poaSeries, yAxis: 0, color: '#ff7300', marker: { enabled: false } },
        { name: 'ACTIVE_POWER', data: activePowerSeries, yAxis: 1, color: '#387908', marker: { enabled: false } }
      ]
    };
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">Dashboard</div>
        <span className="last-updated">{lastUpdated}</span>
      </div>

      <div className="gauge-container">
        <div>
          <h6>Performance Ratio (%)</h6>
          {renderGauge(performanceRatio, "Performance Ratio", 100, "percent")}
        </div>
        <div>
          <h6>Plant Availability (%)</h6>
          {renderGauge(plantAvailability, "Plant Availability", 100, "percent")}
        </div>
        <div>
          <h6>Grid Availability (%)</h6>
          {renderGauge(gridAvailability, "Grid Availability", 100, "percent")}
        </div>
        <div>
          <h6>CUF</h6>
          {renderGauge(cuf, "CUF", 25, "value")}
        </div>
        <div>
          <h6>Active Power (MWp)</h6>
          {renderGauge(currentPower, "Active Power", 21.5, "value")}
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
              <CylinderChart data={barChartData}/>
            </div>
          </div>
        </div>

        <div className="chart">
          <h4 className="component-title">Active Power & POA Trend</h4>
          <HighchartsReact
            highcharts={Highcharts}
            options={getLineChartOptions(lineChartData, height, spacing, (zoomed) => {
              console.log('Zoom changed:', zoomed);
              })}
            ref={chartRef}
          />
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
