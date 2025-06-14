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

const WMS = () => {
  const [wmsData, setWmsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [soilChartData, setSoilChartData] = useState([]);
  const [zoomedData, setZoomedData] = useState([]);
  const [isZooming, setIsZooming] = useState(false);
  const chartRef = useRef(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  const onZoomChange = (zooming) => setIsZooming(zooming);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [wmsRes, chartRes, soilRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/wms`),
          axios.get(`${API_BASE_URL}/api/wms/WMS-CHART`),
          axios.get(`${API_BASE_URL}/api/wms/SOIL-CHART`)
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
  
  const chartHeight = Math.max(250, windowHeight * 0.4);

  const highchartsAreaOptions = {
    chart: {
      type: 'area',
      zoomType: 'x',
      height:chartHeight, // or '100%' if the parent container controls the height
      spacing: [10, 10, 10, 10] ,
      backgroundColor: '#fff',
    },
    title: {
      text: 'Energy vs Loss Due to Soil',
      align: 'center',
      margin: 5,
      style: { fontSize: '16px' }
    },
    xAxis: {
      type: 'datetime',
      title: { text: 'Date' }, 
    },
    yAxis: [{
      title: { text: 'Energy (kWh)' },
      opposite: false
    }, {
      title: { text: 'Loss Due to Soil (%)' },
      opposite: true

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
        name: 'Energy (kWh)',
        data: energyVsSoilData.map(d => [d.time, d.energy]),
        yAxis: 0,
        type: 'area',
        color: '#00BFFF'
      },
      {
        name: 'Loss Due to Soil (%)',
        data: energyVsSoilData.map(d => [d.time, d.soilLoss]),
        yAxis: 1,
        type: 'area',
        color: '#483D8B'
      }
    ],
    credits: { enabled: false }
  };

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
            <ResponsiveContainer width="100%" height="100%">
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
