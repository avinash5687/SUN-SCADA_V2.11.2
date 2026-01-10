import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Tooltip as MuiTooltip, styled, tooltipClasses } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Brush, CartesianGrid
} from "recharts";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./WMS.css";
import ProgressBarCell from './ProgressBarCell';
import { API_ENDPOINTS } from "../apiConfig";

// Custom styled tooltip matching the theme
const StyledTooltip = styled(({ className, ...props }) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.98) 0%, rgba(35, 45, 63, 0.98) 100%)',
    backdropFilter: 'blur(10px)',
    color: '#e0e6ed',
    fontSize: '0.8rem',
    fontWeight: 500,
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(100, 149, 237, 0.4)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(100, 149, 237, 0.2)',
    letterSpacing: '0.3px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(26, 54, 93, 0.98)',
    '&::before': {
      border: '1px solid rgba(100, 149, 237, 0.4)',
      background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.98) 0%, rgba(35, 45, 63, 0.98) 100%)',
    },
  },
}));

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

// Enhanced Skeleton Components
const TableSkeleton = () => (
  <div className="table-skeleton">
    {/* Skeleton Header - matches actual table header */}
    <div className="skeleton-header-row">
      <div className="skeleton-header-cell skeleton-param-header">Parameters</div>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-header-cell">
          <div className="skeleton-sensor-header">
            <div className="skeleton-sensor-name"></div>
            <div className="skeleton-status-dot"></div>
          </div>
        </div>
      ))}
    </div>
    {/* Skeleton Body Rows */}
    {parametersConfig.map((param, idx) => (
      <div 
        key={idx} 
        className="skeleton-row"
        style={{ animationDelay: `${idx * 0.05}s` }}
      >
        <div className="skeleton-cell skeleton-param">{param.name}</div>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-cell">
            {param.max ? (
              <div className="skeleton-progress-bar">
                <div className="skeleton-progress-fill"></div>
                <div className="skeleton-progress-value"></div>
              </div>
            ) : (
              <div className="skeleton-content"></div>
            )}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const ChartSkeleton = ({ height = "400px", title = "Loading Chart Data..." }) => (
  <div className="chart-skeleton" style={{ height }}>
    <div className="skeleton-chart-wrapper">
      {/* Title */}
      <div className="skeleton-chart-header">
        <div className="skeleton-chart-title-text">{title}</div>
      </div>
      
      {/* Chart Body */}
      <div className="skeleton-chart-body">
        {/* Y-Axis Labels */}
        <div className="skeleton-y-axis">
          {[100, 75, 50, 25, 0].map((val, i) => (
            <div key={i} className="skeleton-y-label"></div>
          ))}
        </div>
        
        {/* Chart Area */}
        <div className="skeleton-chart-area">
          {/* Grid Lines */}
          <div className="skeleton-grid-lines">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton-grid-line"></div>
            ))}
          </div>
          
          {/* Wave Animation */}
          <div className="skeleton-wave-container">
            <svg className="skeleton-wave" viewBox="0 0 100 40" preserveAspectRatio="none">
              <path className="skeleton-wave-path wave-1" d="M0,20 Q25,10 50,20 T100,20" />
              <path className="skeleton-wave-path wave-2" d="M0,25 Q25,15 50,25 T100,25" />
              <path className="skeleton-wave-path wave-3" d="M0,30 Q25,20 50,30 T100,30" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* X-Axis Labels */}
      <div className="skeleton-x-axis">
        {['06:00', '09:00', '12:00', '15:00', '18:00'].map((time, i) => (
          <div key={i} className="skeleton-x-label"></div>
        ))}
      </div>
    </div>
  </div>
);

const WMS = () => {
  const [wmsData, setWmsData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [soilChartData, setSoilChartData] = useState([]);
  const [zoomedData, setZoomedData] = useState([]);
  const [isZooming, setIsZooming] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chartRef = useRef(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const onZoomChange = (zooming) => setIsZooming(zooming);

  const fetchAllData = async (isInitial = false) => {
    try {
      if (!isInitial) setIsRefreshing(true);
      
      const [wmsRes, chartRes, soilRes] = await Promise.all([
        axios.get(API_ENDPOINTS.wms.getAll),
        axios.get(API_ENDPOINTS.wms.chart),
        axios.get(API_ENDPOINTS.wms.soilChart)
      ]);

      // Use functional updates to prevent flickering
      setWmsData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(wmsRes.data)) {
          return wmsRes.data;
        }
        return prevData;
      });

      setChartData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(chartRes.data)) {
          setZoomedData(chartRes.data);
          return chartRes.data;
        }
        return prevData;
      });

      setSoilChartData(prevData => {
        if (JSON.stringify(prevData) !== JSON.stringify(soilRes.data)) {
          return soilRes.data;
        }
        return prevData;
      });

    } catch (error) {
      console.error("Error fetching WMS data:", error);
    } finally {
      if (isInitial) setInitialLoading(false);
      if (!isInitial) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAllData(true);

    // Set up interval for subsequent fetches
    const interval = setInterval(() => {
      if (!isZooming) {
        fetchAllData(false);
      }
    }, 30000);

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

  const getMainChartHeightForWidth = (width) => {
    if (width <= 1229) return 330;
    else if (width <= 1240) return 350;
    else if (width <= 1280) return 360;
    else if (width <= 1396) return 380;
    else if (width <= 1440) return 410;
    else if (width <= 1536) return 430;
    else if (width <= 1707) return 450;
    else if (width <= 1920) return 470;
    else return 480;
  };

  const getSoilChartHeightForWidth = (width) => {
    if (width <= 1229) return 200;
    else if (width <= 1240) return 210;
    else if (width <= 1280) return 220;
    else if (width <= 1396) return 230;
    else if (width <= 1440) return 240;
    else if (width <= 1536) return 250;
    else if (width <= 1707) return 260;
    else if (width <= 1920) return 270;
    else return 280;
  };

  const spacing = getSpacingForWidth(windowWidth);
  const mainChartHeight = getMainChartHeightForWidth(windowWidth);
  const soilChartHeight = getSoilChartHeightForWidth(windowWidth);

  const highchartsAreaOptions = {
    chart: {
      type: 'area',
      zoomType: 'x',
      height: soilChartHeight,
      spacing: [5, 5, 5, 5], // Reduced spacing
      backgroundColor: '#fff',
    },
    title: {
      text: 'Loss Due to Soiling',
      align: 'center',
      margin: 2, // Reduced margin
      style: { fontSize: '14px' } // Reduced font size
    },
    subtitle: {
      text: 'Shadow impact may vary the data',
      align: 'center',
      style: { fontSize: '10px', color: '#666' } // Reduced font size
    },
    xAxis: {
      type: 'datetime',
      title: { 
        text: 'Date',
        style: { fontSize: '10px' }
      },
      labels: {
        style: { fontSize: '9px' }
      }
    },
    yAxis: [{
      title: { 
        text: 'Loss Due to Soil (%)',
        style: { fontSize: '10px' }
      },
      labels: {
        style: { fontSize: '9px' }
      },
      opposite: false
    }],
    tooltip: {
      shared: true,
      xDateFormat: '%d-%b %Y %H:%M',
      style: { fontSize: '10px' },
      formatter: function () {
        let s = `<b>${Highcharts.dateFormat('%d-%b %Y %H:%M', this.x)}</b>`;
        this.points.forEach(point => {
          s += `<br/><span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${point.y.toFixed(2)}</b>`;
        });
        return s;
      }
    },
    legend: {
      enabled: false // Removed legend to save space
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
      height: mainChartHeight,
      spacing: spacing,
      animation: {
        duration: 1500,
        easing: 'easeOutBounce'
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
    },
    yAxis: [
      {
        title: { text: 'W/m²' },
        lineColor: '#8884d8',
        lineWidth: 2,
        labels: { style: { color: '#8884d8' } }
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
        fontSize: '12px'
      },
      itemHiddenStyle: {
        color: '#999999',
        textDecoration: 'line-through'
      }
    },
    series: [
      // Visible by default
      { name: 'GHI (W/m²)', data: data.map(d => d.GHI), yAxis: 0, color: '#8884d8', visible: true },
      { name: 'POA (W/m²)', data: data.map(d => d.POA), yAxis: 0, color: '#82ca9d', visible: true },
      { name: 'DHI (W/m²)', data: data.map(d => d.DHI), yAxis: 0, color: '#1E90FF', visible: true },
      { name: 'Module Temperature 1 (°C)', data: data.map(d => d.MOD_TEMP1), yAxis: 2, color: '#FF4500', visible: true },
      { name: 'Ambient Temperature (°C)', data: data.map(d => d.AMB_TEMP), yAxis: 2, color: '#32CD32', visible: true },
      { name: 'Humidity (%)', data: data.map(d => d.RH), yAxis: 2, color: '#FFDAB9', visible: true },
      { name: 'Wind Speed (m/s)', data: data.map(d => d.WND_SPD), yAxis: 3, color: '#6A5ACD', visible: true },
      // Hidden by default - users can enable via legend click
      { name: 'GHI Cumulative (kWh/m²)', data: data.map(d => d.CUM_GHI), yAxis: 1, color: '#FFD700', visible: false },
      { name: 'POA Cumulative (kWh/m²)', data: data.map(d => d.CUM_POA), yAxis: 1, color: '#A0E7E5', visible: false },
      { name: 'DHI Cumulative (kWh/m²)', data: data.map(d => d.DHI_CUMM), yAxis: 1, color: '#B19CD9', visible: false },
      { name: 'Module Temperature 2 (°C)', data: data.map(d => d.MOD_TEMP2), yAxis: 2, color: '#DA70D6', visible: false },
      { name: 'Soiling 1 (%)', data: data.map(d => d.SOI1), yAxis: 2, color: '#556B2F', visible: false },
      { name: 'Transmission Loss 1 (%)', data: data.map(d => d.SOI_LS1), yAxis: 2, color: '#8B4513', visible: false },
      { name: 'Soiling 2 (%)', data: data.map(d => d.SOI2), yAxis: 2, color: '#2F4F4F', visible: false },
      { name: 'Transmission Loss 2 (%)', data: data.map(d => d.SOI_LS2), yAxis: 2, color: '#708090', visible: false },
      { name: 'Wind Direction (°)', data: data.map(d => d.WND_DIR), yAxis: 4, color: '#9370DB', visible: false },
    ],
    plotOptions: {
      series: {
        animation: {
          duration: 1500,
          easing: 'easeOutBounce' 
        },
        events: {
          legendItemClick: function() {
            // Allow toggling series visibility via legend click
            return true;
          }
        },
        showInLegend: true
      }
    }
  });

  return (
    <div className="wms-container">
      {/* Formula Screen Style Header */}
      <div className="wms-header">
        <h2 className="wms-title">Weather Monitoring Station Overview</h2>
        {isRefreshing && (
          <div className="refresh-indicator">
            <div className="refresh-spinner"></div>
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Main Content - Always visible */}
      <div className="wms-grid-content">
        <div className="wms-table-container">
          {initialLoading ? (
            <TableSkeleton />
          ) : (
            <table className="wms-table">
              <thead>
                <tr>
                  <th>Parameters</th>
                  {wmsData.map((sensor, index) => (
                    <th key={index}>
                      <div className="wms-header-content">
                        <span className="header-name">{sensor.ICR || `Sensor ${index + 1}`}</span>
                        <StyledTooltip 
                          title={sensor.CUM_STS === 1 ? 'Online' : 'Offline'} 
                          placement="top" 
                          arrow
                        >
                          <div className={`status-indicator ${sensor.CUM_STS === 1 ? "status-green" : "status-red"}`}></div>
                        </StyledTooltip>
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
          )}
        </div>

        <div className="charts-stack">
          <div className="chart-container main-chart">
            {initialLoading ? (
              <ChartSkeleton height={`${mainChartHeight}px`} title="Loading Weather Trend..." />
            ) : (
              <HighchartsReact
                highcharts={Highcharts} 
                options={highChartsMultiYAxisLine(zoomedData)} 
                containerProps={{ style: { height: "100%", width: "100%" } }}
              />
            )}
          </div>

          <div className="chart-container soil-chart">
            {initialLoading ? (
              <ChartSkeleton height={`${soilChartHeight}px`} title="Loading Soiling Data..." />
            ) : (
              <HighchartsReact
                highcharts={Highcharts}
                options={highchartsAreaOptions}
                containerProps={{ style: { height: "100%", width: "100%" } }}
                ref={chartRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WMS;
