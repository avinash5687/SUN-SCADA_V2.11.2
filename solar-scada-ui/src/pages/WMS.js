import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush, CartesianGrid
} from "recharts";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./WMS.css";
import ProgressBarCell from './ProgressBarCell';

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000";

const parametersConfig = [
  { name: "Timestamp", key: "Date_Time", unit: "", max: null },
  { name: "GHI", key: "GHI", unit: "W/m²", max: 1600 },
  { name: "GHI Cumulative", key: "CUM_GHI", unit: "kWh/m²", max: 10 },
  { name: "POA", key: "POA1", unit: "W/m²", max: 1600 },
  { name: "POA Cumulative", key: "CUM_POA1", unit: "kWh/m²", max: 10 },
  { name: "DHI", key: "DHI", unit: "W/m²", max: 1600 },
  { name: "DHI Cumulative", key: "DHI_CUMM", unit: "kWh/m²", max: 10 },
  { name: "Module Temperature 1", key: "MOD_TEMP1", unit: "°C", max: 100 },
  { name: "Module Temperature 2", key: "MOD_TEMP2", unit: "°C", max: 100 },
  { name: "Ambient Temperature", key: "AMB_TEMP", unit: "°C", max: 100 },
  { name: "Humidity", key: "RH", unit: "%", max: 100 },
  { name: "Wind Speed", key: "WND_SPD", unit: "m/s", max: 15 },
  { name: "Wind Direction", key: "WND_DIR", unit: "°", max: 360 },
  { name: "Rainfall", key: "RAIN", unit: "mm", max: 200 },
  { name: "Soiling 1", key: "SOI1", unit: "%", max: 100 },
  { name: "Transmission Loss 1", key: "SOI_LS1", unit: "%", max: 100 },
  { name: "Soiling 2", key: "SOI2", unit: "%", max: 100 },
  { name: "Transmission Loss 2", key: "SOI_LS2", unit: "%", max: 100 },
];

const plantKPIList = [
  { label: "Export", key: "P_EXP", unit: "kWh" },
  { label: "Import", key: "P_IMP", unit: "kWh" },
  { label: "PR", key: "PR", unit: "%" },
  { label: "POA", key: "POA", unit: "kWh/m²" },
  { label: "CUF", key: "CUF", unit: "%" },
  { label: "PA", key: "PA", unit: "%" },
  { label: "GA", key: "GA", unit: "%" },
];

const WMS = () => {
  const [wmsData, setWmsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [soilChartData, setSoilChartData] = useState([]);
  const [zoomedData, setZoomedData] = useState([]);
  const [isZooming, setIsZooming] = useState(false);
  const chartRef = useRef(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [plantKPI, setPlantKPI] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [wmsRes, chartRes, soilRes, kpiRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/wms`),
          axios.get(`${API_BASE_URL}/api/wms/WMS-CHART`),
          axios.get(`${API_BASE_URL}/api/wms/SOIL-CHART`),
          axios.get(`${API_BASE_URL}/api/dashboard/plant-kpi?_=${Date.now()}`)
        ]);

        setWmsData(wmsRes.data);
        setChartData(chartRes.data);
        setZoomedData(chartRes.data);
        setSoilChartData(soilRes.data);
        setPlantKPI(Array.isArray(kpiRes.data) && kpiRes.data.length > 0 ? kpiRes.data[0] : {});
      } catch (error) {
        console.error("Error fetching WMS data:", error);
      }
    };

    fetchAllData();
    const interval = setInterval(() => { if (!isZooming) fetchAllData(); }, 30000);
    return () => clearInterval(interval);
  }, [isZooming]);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.chart.reflow();
        setWindowHeight(window.innerHeight);
        setWindowWidth(window.innerWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSpacingForWidth = (width) => {
    if (width <= 1229) return [10,5,35,0];
    else if (width <= 1240) return [20, 10, 50, 0];
    else if (width <= 1280) return [8, 10, 58, 0];
    else if (width <= 1396) return [20, 10, 50, 0];
    else if (width <= 1440) return [10, 10, 50, 0];
    else if (width <= 1536) return [20, 0, 80, 0];
    else if (width <= 1707) return [20, 14, 45, 0];
    else if (width <= 1920) return [16, 16, 30, 0];
    else return [15, 20, 25, 10];
  };

  const getHeightForWidth = (width) => {
    if (width <= 1229) return 300;
    else if (width <= 1240) return 320;
    else if (width <= 1280) return 330;
    else if (width <= 1396) return 350;
    else if (width <= 1440) return 380;
    else if (width <= 1536) return 400;
    else if (width <= 1707) return 420;
    else if (width <= 1920) return 440;
    else return 450;
  };

  const spacing = getSpacingForWidth(windowWidth);
  const height = getHeightForWidth(windowWidth);
  const chartHeight = Math.max(250, windowHeight * 0.4);

  const energyVsSoilData = soilChartData.map(row => ({
    time: new Date(row.Date).getTime(),
    energy: Number(row.Energy) || 0,
    soilLoss: Number(row.Loss_Due_To_Soil) || 0,
  }));

  const highchartsAreaOptions = {
    chart: {
      type: 'area',
      zoomType: 'x',
      height: chartHeight,
      spacing: [10, 10, 10, 10],
      backgroundColor: '#fff',
    },
    title: {
      text: 'Loss Due to Soiling',
      align: 'center',
      margin: 5,
      style: { fontSize: '16px' }
    },
    subtitle: {
      text: 'Shadow impact may vary the data',
      align: 'center',
      style: { fontSize: '12px', color: '#666' }
    },
    xAxis: {
      type: 'datetime',
      title: { text: 'Date' },
    },
    yAxis: [{
      title: { text: 'Loss Due to Soil (%)' },
      opposite: false
    }],
    tooltip: {
      shared: true,
      xDateFormat: '%d-%b %Y %H:%M',
      formatter: function () {
        let s = `<b>${Highcharts.dateFormat('%d-%b %Y %H:%M', this.x)}</b>`;
        this.points.forEach(point => {
          s += `<br/><span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${point.y.toFixed(2)}</b>`;
        });
        return s;
      }
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom'
    },
    plotOptions: {
      area: {
        stacking: 'null',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          enabled: false
        }
      }
    },
    series: [
      {
        name: 'Loss Due to Soil (%)',
        data: energyVsSoilData.map(d => [d.time, d.soilLoss]),
        yAxis: 0,
        type: 'area',
        color: '#483D8B'
      }
    ],
    credits: { enabled: false }
  };

  const highChartsMultiYAxisLine = (data) => ({
    chart: {
      type: 'line',
      zoomType: 'x',
      height: height,
      spacing: spacing
    },
    title: { text: '' },
    xAxis: {
      categories: data.map(item => item.Date_Time),
      gridLineWidth: 1,
    },
    yAxis: [
      { title: { text: 'W/m²' }, lineColor: '#8884d8', labels: { style: { color: '#8884d8' } } },
      { title: { text: 'kWh/m²' }, opposite: true, labels: { style: { color: '#82ca9d' } } },
      { title: { text: '°C / %' }, opposite: true, labels: { style: { color: '#ff7300' } } },
      { title: { text: 'm/s' }, opposite: true, labels: { style: { color: '#6A5ACD' } } },
      { title: { text: '°' }, opposite: true, labels: { style: { color: '#9370DB' } } }
    ],
    tooltip: { shared: true },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: { fontSize: '13px' }
    },
    series: [
      { name: 'GHI (W/m²)', data: data.map(d => d.GHI), yAxis: 0, color: '#8884d8' },
      { name: 'POA (W/m²)', data: data.map(d => d.POA), yAxis: 0, color: '#82ca9d' },
      { name: 'DHI (W/m²)', data: data.map(d => d.DHI), yAxis: 0, color: '#1E90FF' },
      { name: 'GHI Cumulative (kWh/m²)', data: data.map(d => d.CUM_GHI), yAxis: 1, color: '#FFD700' },
      { name: 'POA Cumulative (kWh/m²)', data: data.map(d => d.CUM_POA), yAxis: 1, color: '#A0E7E5' },
      { name: 'DHI Cumulative (kWh/m²)', data: data.map(d => d.DHI_CUMM), yAxis: 1, color: '#B19CD9' },
      { name: 'Module Temp 1 (°C)', data: data.map(d => d.MOD_TEMP1), yAxis: 2, color: '#FF4500' },
      { name: 'Ambient Temp (°C)', data: data.map(d => d.AMB_TEMP), yAxis: 2, color: '#32CD32' },
      { name: 'Humidity (%)', data: data.map(d => d.RH), yAxis: 2, color: '#FFDAB9' },
      { name: 'Wind Speed (m/s)', data: data.map(d => d.WND_SPD), yAxis: 3, color: '#6A5ACD' },
      { name: 'Wind Direction (°)', data: data.map(d => d.WND_DIR), yAxis: 4, color: '#9370DB' }
    ]
  });

  return (
    <div className="wms-container-fullscreen">
      <h2 className="wms-title"></h2>

      {/* ✅ Plant KPI Summary Bar */}
      <div className="plant-kpi-bar1">
        {plantKPIList.map(({ label, key, unit }) => (
          <div key={label} className="kpi-box1">
            <span className="kpi-label1">{label}</span>
            <span className="kpi-value1">
              {plantKPI[key] !== undefined && plantKPI[key] !== null
                ? `${parseFloat(plantKPI[key]).toFixed(2)} ${unit}`
                : "--"}
            </span>
          </div>
        ))}
      </div>

      <div className="wms-grid-content">
        <div className="wms-table-container">
          <table className="wms-table">
            <thead>
              <tr>
                <th>Parameters</th>
                {wmsData.map((sensor, index) => (
                  <th key={index}>
                    <div className="wms-header-content">
                      <span className="header-name">{sensor.ICR || `Sensor ${index + 1}`}</span>
                      <div className={`status-indicator ${sensor.CUM_STS === 1 ? "status-green" : "status-red"}`}></div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parametersConfig.map((param, idx) => (
                <tr key={idx}>
                  <td>{param.name}</td>
                  {wmsData.map((sensor, index) => (
                    <td key={index}>
                      {param.max ? (
                        <ProgressBarCell value={sensor[param.key]} max={param.max} unit={param.unit} />
                      ) : (
                        sensor[param.key] || 0
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="charts-stack">
          <div className="chart-container">
            <HighchartsReact
              highcharts={Highcharts}
              options={highChartsMultiYAxisLine(zoomedData)}
              containerProps={{ style: { height: "100%", width: "100%" } }}
            />
          </div>

          <div className="chart-container">
            <HighchartsReact
              highcharts={Highcharts}
              options={highchartsAreaOptions}
              containerProps={{ style: { height: "100%", width: "100%" } }}
              ref={chartRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WMS;
