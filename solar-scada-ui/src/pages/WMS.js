// (No change at top imports)
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush, CartesianGrid
} from "recharts";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./WMS.css";
import ProgressBarCell from './ProgressBarCell';
import { API_ENDPOINTS } from "../apiConfig";

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

const WMS = () => {
  const [wmsData, setWmsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [soilChartData, setSoilChartData] = useState([]);
  const [zoomedData, setZoomedData] = useState([]);
  const [isZooming, setIsZooming] = useState(false);
  const chartRef = useRef(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const onZoomChange = (zooming) => setIsZooming(zooming)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [wmsRes, chartRes, soilRes] = await Promise.all([
          axios.get(API_ENDPOINTS.wms.getAll),
          axios.get(API_ENDPOINTS.wms.chart),
          axios.get(API_ENDPOINTS.wms.soilChart)
        ]);
        setWmsData(wmsRes.data);
        setChartData(chartRes.data);
        setZoomedData(chartRes.data);
        setSoilChartData(soilRes.data);
      } catch (error) {
        console.error("Error fetching WMS data:", error);
      }
    };
    fetchAllData();
    const interval = setInterval(() => { if (!isZooming) fetchAllData(); }, 30000);
    return () => clearInterval(interval);
  }, [isZooming]);

  const handleBrushChange = (range) => {
    if (range && range.startIndex !== undefined && range.endIndex !== undefined) {
      setZoomedData(chartData.slice(range.startIndex, range.endIndex + 1));
    }
  };

  const energyVsSoilData = soilChartData.map(row => ({
    time: new Date(row.Date).getTime(),
    energy: Number(row.Energy) || 0,
    soilLoss: Number(row.Loss_Due_To_Soil) || 0,
  }));

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.chart.reflow();
        setWindowHeight(window.innerHeight);
      }
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
 useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
    else if (width <= 1707) return 420
    else if (width <= 1920) return 440;
    else return 450;
  };

  const spacing = getSpacingForWidth(windowWidth);
  const height = getHeightForWidth(windowWidth);

  const chartHeight = Math.max(250, windowHeight * 0.4);

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
      height:height,
      spacing: spacing,
      animation: {
        duration: 1500,
        easing: 'easeOutBounce' // You can try 'easeOutBounce', 'easeOutElastic', 'easeOutBack', etc.
      }
    },
    title: {
      text: ''
    },
    xAxis: {
      categories: data.map(item => item.Date_Time),
      gridLineWidth: 1,
      title: { text: '' },
      tickmarkPlacement: 'on',
  //     min: 0.5,        // Add this
  // max: data.length - 0.5  
    },
    yAxis: [
      {
        title: { text: 'W/m²' },
        lineColor: '#8884d8',
        lineWidth: 2,
        labels: { style: { color: '#8884d8' } , }
      },
      {
        title: { text: 'kWh/m²' },
        lineColor: '#82ca9d',
        lineWidth: 2,
        labels: { style: { color: '#82ca9d' } },
        opposite: true
      },
      {
        title: { text: '°C / %' },
        lineColor: '#ff7300',
        lineWidth: 2,
        labels: { style: { color: '#ff7300' } },
        opposite: true
      },
      {
        title: { text: 'm/s' },
        lineColor: '#6A5ACD',
        lineWidth: 1,
        labels: { style: { color: '#6A5ACD' } },
        opposite: true
      },
      {
        title: { text: '°' },
        lineColor: '#9370DB',
        lineWidth: 1,
        labels: { style: { color: '#9370DB' } },
        opposite: true
      }
    ],
    tooltip: {
      shared: true,
      crosshairs: true
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: {
        fontSize: '13px'  // smaller text to fit better
      }
    },
    series: [
      { name: 'GHI (W/m²)', data: data.map(d => d.GHI), yAxis: 0, color: '#8884d8', animation: { duration: 1000, easing: 'easeOutElastic' } },
      { name: 'POA (W/m²)', data: data.map(d => d.POA), yAxis: 0, color: '#82ca9d' },
      { name: 'DHI (W/m²)', data: data.map(d => d.DHI), yAxis: 0, color: '#1E90FF' },
  
      { name: 'GHI Cumulative (kWh/m²)', data: data.map(d => d.CUM_GHI), yAxis: 1, color: '#FFD700' },
      { name: 'POA Cumulative (kWh/m²)', data: data.map(d => d.CUM_POA), yAxis: 1, color: '#A0E7E5' },
      { name: 'DHI Cumulative (kWh/m²)', data: data.map(d => d.DHI_CUMM), yAxis: 1, color: '#B19CD9' },
  
      { name: 'Module Temperature 1 (°C)', data: data.map(d => d.MOD_TEMP1), yAxis: 2, color: '#FF4500' },
      { name: 'Module Temperature 2 (°C)', data: data.map(d => d.MOD_TEMP2), yAxis: 2, color: '#DA70D6' },
      { name: 'Ambient Temperature (°C)', data: data.map(d => d.AMB_TEMP), yAxis: 2, color: '#32CD32' },
      { name: 'Humidity (%)', data: data.map(d => d.RH), yAxis: 2, color: '#FFDAB9' },
      { name: 'Soiling 1 (%)', data: data.map(d => d.SOI1), yAxis: 2, color: '#556B2F' },
      { name: 'Transmission Loss 1 (%)', data: data.map(d => d.SOI_LS1), yAxis: 2, color: '#8B4513' },
      { name: 'Soiling 2 (%)', data: data.map(d => d.SOI2), yAxis: 2, color: '#2F4F4F' },
      { name: 'Transmission Loss 2 (%)', data: data.map(d => d.SOI_LS2), yAxis: 2, color: '#708090' },
  
      { name: 'Wind Speed (m/s)', data: data.map(d => d.WND_SPD), yAxis: 3, color: '#6A5ACD' },
      { name: 'Wind Direction (°)', data: data.map(d => d.WND_DIR), yAxis: 4, color: '#9370DB' },
    ],
    plotOptions: {
      series: {
        animation: {
          duration: 1500,
          easing: 'easeOutBounce' 
        }
      }
    }
  });
  

  return (
    <div className="wms-container-fullscreen">
      <h2 className="wms-title">Weather Monitoring Station Overview</h2>
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
              options={{
                ...highchartsAreaOptions,
                // chart: {
                //   ...highchartsAreaOptions.chart,
                //   height: 600, // Increase height (you can adjust this)
                // },
              }}
              containerProps={{ style: { height: "100%", width: "100%" } }} // Increase height & width
              ref={chartRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WMS;
