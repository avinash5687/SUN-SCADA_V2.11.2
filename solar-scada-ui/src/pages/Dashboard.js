import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import DeviceStatusPopup from "../components/DeviceStatusPopup";
import { API_ENDPOINTS } from "../apiConfig";
import { PieChart, Pie, Cell } from "recharts";
import "./Dashboard.css";
import CylinderChart from "../components/CylinderChart";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Dashboard = () => {
  // State management with loading states
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
  const [loading, setLoading] = useState(true);
  const [dataLoadingStates, setDataLoadingStates] = useState({
    kpi: true,
    charts: true,
    wms: true,
    devices: true
  });

  const chartRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Optimized data fetching with skeleton loading
  const fetchData = useCallback(async () => {
    const API_TIMEOUT = 8000; // 8 seconds timeout
    const axiosConfig = { timeout: API_TIMEOUT };

    try {
      // Set initial loading to false to show skeleton immediately
      setLoading(false);

      // Fetch all data simultaneously
      const apiPromises = [
        // Plant KPI data
        axios.get(API_ENDPOINTS.dashboard.plantKpi, {
          params: { _: Date.now() },
          ...axiosConfig
        })
          .then(({ data }) => {
            const newKPI = data?.[0] || {};
            setPlantKPI((prev) => (JSON.stringify(prev) !== JSON.stringify(newKPI) ? newKPI : prev));
            setCurrentPower(newKPI.currentPower || 0);
            setPerformanceRatio(newKPI.PR || 0);
            setPlantAvailability(newKPI.PA || 0);
            setGridAvailability(newKPI.GA || 0);
            setCUF(newKPI.CUF || 0);
            setDataLoadingStates(prev => ({ ...prev, kpi: false }));
            console.log('✅ KPI data loaded');
          })
          .catch(err => {
            console.error('❌ KPI API Error:', err);
            setDataLoadingStates(prev => ({ ...prev, kpi: false }));
          }),

        // Line chart data
        axios.get(API_ENDPOINTS.dashboard.lineChart, axiosConfig)
          .then(({ data }) => {
            setLineChartData((prev) => (JSON.stringify(prev) !== JSON.stringify(data) ? data : prev));
            setDataLoadingStates(prev => ({ ...prev, charts: false }));
            console.log('✅ Line chart data loaded');
          })
          .catch(err => {
            console.error('❌ Line Chart API Error:', err);
            setDataLoadingStates(prev => ({ ...prev, charts: false }));
          }),

        // WMS data
        axios.get(API_ENDPOINTS.dashboard.wmsData, axiosConfig)
          .then(({ data }) => {
            const newWMSData = data?.[0] || {};
            setWMSData((prev) => (JSON.stringify(prev) !== JSON.stringify(newWMSData) ? newWMSData : prev));

            if (newWMSData.Date_Time) {
              setLastUpdated(`Last updated: ${newWMSData.Date_Time}`);
            }
            setDataLoadingStates(prev => ({ ...prev, wms: false }));
            console.log('✅ WMS data loaded');
          })
          .catch(err => {
            console.error('❌ WMS API Error:', err);
            setDataLoadingStates(prev => ({ ...prev, wms: false }));
          }),

        // Device status
        axios.get(API_ENDPOINTS.dashboard.deviceStatus, axiosConfig)
          .then(({ data }) => {
            setDeviceStatus(data);
            setDataLoadingStates(prev => ({ ...prev, devices: false }));
            console.log('✅ Device status loaded');
          })
          .catch(err => {
            console.error('❌ Device Status API Error:', err);
            setDataLoadingStates(prev => ({ ...prev, devices: false }));
          })
      ];

      await Promise.allSettled(apiPromises);

    } catch (error) {
      console.error("Critical API Error:", error);
    }
  }, []);

  const fetchBarChartData = useCallback(async () => {
    let apiUrl = API_ENDPOINTS.dashboard.barChart;

    if (trendType === "week") apiUrl = API_ENDPOINTS.dashboard.barChartWeek;
    else if (trendType === "month") apiUrl = API_ENDPOINTS.dashboard.barChartMonth;
    else if (trendType === "year") apiUrl = API_ENDPOINTS.dashboard.barChartYear;

    try {
      const { data } = await axios.get(apiUrl, { params: { date: selectedDate } });
      setBarChartData(data);
    } catch (error) {
      console.error("Bar Chart API Error:", error);
    }
  }, [trendType, selectedDate]);

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
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Skeleton loading components
  const SkeletonGauge = () => (
    <div className="skeleton-gauge">
      <div className="skeleton-gauge-title"></div>
      <div className="skeleton-gauge-circle"></div>
    </div>
  );

  const SkeletonChart = () => (
    <div className="skeleton-chart">
      <div className="skeleton-chart-header">
        <div className="skeleton-chart-title"></div>
        <div className="skeleton-chart-controls"></div>
      </div>
      <div className="skeleton-chart-body"></div>
    </div>
  );

  const SkeletonTable = () => (
    <div className="skeleton-table">
      <div className="skeleton-table-header"></div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-table-cell"></div>
          <div className="skeleton-table-cell"></div>
          <div className="skeleton-table-cell"></div>
        </div>
      ))}
    </div>
  );

  const SkeletonMetricCard = () => (
    <div className="skeleton-metric-card">
      <div className="skeleton-metric-icon"></div>
      <div className="skeleton-metric-content">
        <div className="skeleton-metric-label"></div>
        <div className="skeleton-metric-value"></div>
      </div>
    </div>
  );

  // Enhanced gauge rendering with better responsiveness
  const getGaugeRadii = (screenWidth) => {
    if (screenWidth <= 1280) return { innerRadius: 18, outerRadius: 30 };
    if (screenWidth <= 1366) return { innerRadius: 18, outerRadius: 30 };
    if (screenWidth <= 1440) return { innerRadius: 28, outerRadius: 46 };
    if (screenWidth <= 1536) return { innerRadius: 28, outerRadius: 46 };
    if (screenWidth <= 1920) return { innerRadius: 32, outerRadius: 52 };
    return { innerRadius: 35, outerRadius: 58 };
  };

  const renderGauge = (value, label, max = 100, displayType = "percent") => {
    const { innerRadius, outerRadius } = getGaugeRadii(screenWidth);
    const segments = 20;
    const filledSegments = Math.round((value / max) * segments);

    let fillColor = "#27ae60"; // Green for good values
    if ((value / max) * 100 < 70) fillColor = "#e74c3c"; // Red for low values
    else if ((value / max) * 100 <= 80) fillColor = "#f39c12"; // Orange for medium values

    const data = Array.from({ length: segments }, (_, index) => ({
      value: 1,
      color: index < filledSegments ? fillColor : "#ecf0f1",
    }));

    let centerText = "";
    if (displayType === "value") {
      centerText = Number(value).toFixed(1).replace(/\.00$/, "");
    } else {
      const percentValue = (value / max) * 100;
      centerText = percentValue === 100 ? "100" : percentValue.toFixed(1).replace(/\.0$/, "");
    }

    return (
      <div className="gauge-wrapper">
        <PieChart width={outerRadius * 2 + 20} height={outerRadius * 2 + 10}>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={90}
            endAngle={-270}
            paddingAngle={1.5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="gauge-center-text">{centerText}</div>
      </div>
    );
  };

  // Chart configurations
  const getSpacingForWidth = (width) => {
    if (width <= 1229) return [10, 2, 14, 0];
    if (width <= 1280) return [5, 6, 14, 0];
    if (width <= 1440) return [10, 10, 10, 0];
    if (width <= 1920) return [16, 16, 10, 0];
    return [18, 10, 10, 0];
  };

  const getHeightForWidth = (width) => {
    if (width <= 1229) return 180;
    if (width <= 1280) return 180;
    if (width <= 1440) return 200;
    if (width <= 1920) return 220;
    return 250;
  };

  const spacing = getSpacingForWidth(windowWidth);
  const height = getHeightForWidth(windowWidth);

  const getLineChartOptions = (data, height, spacing) => {
    // Helper function to convert "HH:MM" string to decimal hours
    const timeStringToDecimalHour = (timeString) => {
      const [hours, minutes] = timeString.split(':').map(Number);
      return hours + (minutes / 60);
    };

    // Process minute-wise data to extract hour information
    const processedData = data.map(d => {
      const decimalHour = timeStringToDecimalHour(d.Date_Time);

      return {
        x: decimalHour,
        poa: Math.max(d.POA || 0, 0), // Ensure POA is never negative
        activePower: Math.max(d.ACTIVE_POWER || 0, 0), // Ensure ACTIVE_POWER is never negative
        originalTime: d.Date_Time,
        hour: Math.floor(decimalHour),
        minute: Math.round((decimalHour % 1) * 60)
      };
    });

    // Remove duplicates and sort by time
    const uniqueData = [];
    const seen = new Set();

    processedData.forEach(item => {
      const key = item.x.toFixed(4); // Use decimal hour as key with 4 decimal precision
      if (!seen.has(key)) {
        seen.add(key);
        uniqueData.push(item);
      }
    });

    // Sort by decimal hour
    uniqueData.sort((a, b) => a.x - b.x);

    // Create series data with x-y coordinates
    const poaSeries = uniqueData.map(d => [d.x, d.poa]);
    const activePowerSeries = uniqueData.map(d => [d.x, d.activePower]);

    const maxPOA = Math.max(...uniqueData.map(d => d.poa), 100);
    const maxActivePower = Math.max(...uniqueData.map(d => d.activePower), 100);

    return {
      chart: {
        type: 'line',
        zoomType: 'x',
        height: height,
        spacing: spacing,
        animation: { duration: 800 },
        backgroundColor: '#ffffff'
      },
      title: { text: '' },
      xAxis: {
        type: 'linear', // Changed from datetime to linear
        min: 0,
        max: 24,
        tickInterval: 2, // Show tick every 2 hours
        labels: {
          style: { fontSize: '10px' },
          formatter: function () {
            // Format as hour (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24)
            return this.value + ':00';
          }
        },
        gridLineWidth: 1,
        gridLineColor: '#e6e6e6'
      },
      yAxis: [
        {
          title: { text: 'POA (W/m²)', style: { fontSize: '11px' } },
          opposite: false,
          lineColor: '#ff7300',
          lineWidth: 2,
          labels: { style: { color: '#ff7300', fontSize: '10px' } },
          min: 0, // Fixed minimum to 0
          max: Math.ceil(maxPOA * 1.1)
        },
        {
          title: { text: 'ACTIVE POWER (kW)', style: { fontSize: '11px' } },
          opposite: true,
          lineColor: '#387908',
          lineWidth: 2,
          labels: { style: { color: '#387908', fontSize: '10px' } },
          min: 0, // Fixed minimum to 0 (removed negative value handling)
          max: Math.ceil(maxActivePower * 1.1)
        }
      ],
      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { fontSize: '10px' }
      },
      tooltip: {
        shared: true,
        crosshairs: true,
        style: { fontSize: '11px' },
        formatter: function () {
          const hour = Math.floor(this.x);
          const minute = Math.round((this.x - hour) * 60);
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

          let tooltipContent = `<b>Time: ${timeStr}</b><br/>`;

          this.points.forEach(point => {
            const color = point.series.color;
            const name = point.series.name;
            const value = point.y.toFixed(2);
            const unit = name === 'POA' ? 'W/m²' : 'kW';
            tooltipContent += `<span style="color:${color}">●</span> ${name}: <b>${value} ${unit}</b><br/>`;
          });

          return tooltipContent;
        }
      },
      plotOptions: {
        line: {
          connectNulls: false,
          lineWidth: 2,
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true,
                radius: 4
              }
            }
          }
        }
      },
      series: [
        {
          name: 'POA',
          data: poaSeries,
          yAxis: 0,
          color: '#ff7300',
          lineWidth: 2,
          visible: true // Ensure series is visible
        },
        {
          name: 'ACTIVE POWER',
          data: activePowerSeries,
          yAxis: 1,
          color: '#387908',
          lineWidth: 2,
          visible: true // Ensure series is visible
        }
      ],
      credits: { enabled: false }
    };
  };


  return (
    <div className="dashboard-container">
      {/* Formula Screen Style Header - FIXED */}
      <div className="dashboard-header">
        <h2 className="dashboard-title">Dashboard</h2>
        <div className="dashboard-meta">
          {lastUpdated && <span className="last-updated">{lastUpdated}</span>}
          {Object.values(dataLoadingStates).some(loading => loading) && (
            <div className="sync-indicator">
              <div className="sync-spinner"></div>
              <span>Syncing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* KPI Gauges Section */}
        <div className="dashboard-section gauges-section">
          <div className="gauge-container">
            {dataLoadingStates.kpi ? (
              [...Array(5)].map((_, i) => <SkeletonGauge key={i} />)
            ) : (
              <>
                <div className="gauge-item">
                  <h6>Performance Ratio (%)</h6>
                  {renderGauge(performanceRatio, "Performance Ratio", 100, "percent")}
                </div>
                <div className="gauge-item">
                  <h6>Plant Availability (%)</h6>
                  {renderGauge(plantAvailability, "Plant Availability", 100, "percent")}
                </div>
                <div className="gauge-item">
                  <h6>Grid Availability (%)</h6>
                  {renderGauge(gridAvailability, "Grid Availability", 100, "percent")}
                </div>
                <div className="gauge-item">
                  <h6>CUF</h6>
                  {renderGauge(cuf, "CUF", 25, "value")}
                </div>
                <div className="gauge-item">
                  <h6>Active Power (MW)</h6>
                  {renderGauge(currentPower, "Active Power", 21.5, "value")}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="dashboard-section charts-section">
          <div className="charts-container">
            {/* Energy Chart */}
            <div className="chart-card">
              {dataLoadingStates.charts ? (
                <SkeletonChart />
              ) : (
                <>
                  <div className="chart-header">
                    <h4 className="chart-title">Energy Generation</h4>
                    <div className="chart-controls">
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="date-picker"
                      />
                      <div className="trend-buttons">
                        {['day', 'week', 'month', 'year'].map(type => (
                          <button
                            key={type}
                            className={`trend-btn ${trendType === type ? 'active' : ''}`}
                            onClick={() => setTrendType(type)}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="chart-content">
                    <div className="generation-summary">
                      Total Generation: <span className="total-value">
                        {barChartData.reduce((sum, item) => sum + (parseFloat(item["Energy Generated"]) || 0), 0).toFixed(2)} MW
                      </span>
                    </div>
                    <div className="chart-wrapper">
                      <CylinderChart data={barChartData} trendType={trendType} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Line Chart */}
            <div className="chart-card">
              {dataLoadingStates.charts ? (
                <SkeletonChart />
              ) : (
                <>
                  <div className="chart-header">
                    <h4 className="chart-title">Power & Irradiance Trend</h4>
                  </div>
                  <div className="chart-content">
                    <HighchartsReact
                      highcharts={Highcharts}
                      options={getLineChartOptions(lineChartData, height, spacing)}
                      ref={chartRef}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Data Tables Section - Compact for 1280x632 */}
        <div className="dashboard-section tables-section">
          <div className="tables-container">
            {/* Equipment Status */}
            <div className="table-card">
              <div className="table-header">
                <h4 className="table-title">Equipment Status</h4>
                <button
                  className="action-btn"
                  onClick={() => setShowPopup(true)}
                  disabled={dataLoadingStates.devices}
                >
                  View Details
                </button>
              </div>
              {dataLoadingStates.devices ? (
                <SkeletonTable />
              ) : (
                <div className="table-content">
                  <table className="status-table">
                    <thead>
                      <tr>
                        <th>Equipment</th>
                        <th>Total</th>
                        <th>Running</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Inverter</td>
                        <td>4</td>
                        <td>{plantKPI.INV_CNT || 0}</td>
                        <td><span className={`status-badge ${plantKPI.INV_CNT >= 3 ? 'good' : 'warning'}`}>
                          {plantKPI.INV_CNT >= 3 ? 'Good' : 'Warning'}
                        </span></td>
                      </tr>
                      <tr>
                        <td>MFM</td>
                        <td>8</td>
                        <td>{plantKPI.MFM_CNT || 0}</td>
                        <td><span className={`status-badge ${plantKPI.MFM_CNT >= 6 ? 'good' : 'warning'}`}>
                          {plantKPI.MFM_CNT >= 6 ? 'Good' : 'Warning'}
                        </span></td>
                      </tr>
                      <tr>
                        <td>Transformer</td>
                        <td>2</td>
                        <td>{plantKPI.PLC_CNT || 0}</td>
                        <td><span className={`status-badge ${plantKPI.PLC_CNT >= 2 ? 'good' : 'critical'}`}>
                          {plantKPI.PLC_CNT >= 2 ? 'Good' : 'Critical'}
                        </span></td>
                      </tr>
                      <tr>
                        <td>WMS</td>
                        <td>1</td>
                        <td>{plantKPI.WMS_CNT || 0}</td>
                        <td><span className={`status-badge ${plantKPI.WMS_CNT >= 1 ? 'good' : 'critical'}`}>
                          {plantKPI.WMS_CNT >= 1 ? 'Good' : 'Critical'}
                        </span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Weather Data */}
            <div className="table-card">
              <div className="table-header">
                <h4 className="table-title">Weather Monitoring</h4>
              </div>
              {dataLoadingStates.wms ? (
                <SkeletonTable />
              ) : (
                <div className="table-content">
                  <table className="weather-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                        <th>Unit</th>
                        <th>Parameter</th>
                        <th>Value</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>POA</td>
                        <td>{wmsData.POA1 || 0}</td>
                        <td>W/m²</td>
                        <td>GHI</td>
                        <td>{wmsData.GHI || 0}</td>
                        <td>W/m²</td>
                      </tr>
                      <tr>
                        <td>Cumulative POA</td>
                        <td>{wmsData.CUM_POA1 || 0}</td>
                        <td>kWh/m²</td>
                        <td>Cumulative GHI</td>
                        <td>{wmsData.CUM_GHI || 0}</td>
                        <td>kWh/m²</td>
                      </tr>
                      <tr>
                        <td>Module Temp 1</td>
                        <td>{wmsData.MOD_TEMP1 || 0}</td>
                        <td>°C</td>
                        <td>Module Temp 2</td>
                        <td>{wmsData.MOD_TEMP2 || 0}</td>
                        <td>°C</td>
                      </tr>
                      <tr>
                        <td>Ambient Temp</td>
                        <td>{wmsData.AMB_TEMP || 0}</td>
                        <td>°C</td>
                        <td>Rainfall</td>
                        <td>{wmsData.RAIN || 0}</td>
                        <td>mm</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPI Cards Section - Compact */}
        <div className="dashboard-section metrics-section">
          <div className="metrics-container">
            {dataLoadingStates.kpi ? (
              [...Array(6)].map((_, i) => <SkeletonMetricCard key={i} />)
            ) : (
              <>
                <div className="metric-card green">
                  <div className="metric-icon">🌟</div>
                  <div className="metric-content">
                    <div className="metric-label">Plant Export</div>
                    <div className="metric-value">{plantKPI.P_EXP || 0} kWh</div>
                  </div>
                </div>
                <div className="metric-card red">
                  <div className="metric-icon">⚡</div>
                  <div className="metric-content">
                    <div className="metric-label">Plant Import</div>
                    <div className="metric-value">{plantKPI.P_IMP || 0} kWh</div>
                  </div>
                </div>
                <div className="metric-card blue">
                  <div className="metric-icon">⚠️</div>
                  <div className="metric-content">
                    <div className="metric-label">Grid Downtime</div>
                    <div className="metric-value">{plantKPI.P_DOWN || "00:00"} Hrs</div>
                  </div>
                </div>
                <div className="metric-card orange">
                  <div className="metric-icon">🌄</div>
                  <div className="metric-content">
                    <div className="metric-label">Start Time</div>
                    <div className="metric-value">{plantKPI.P_START || "00:00"} Hrs</div>
                  </div>
                </div>
                <div className="metric-card gray">
                  <div className="metric-icon">🌃</div>
                  <div className="metric-content">
                    <div className="metric-label">Stop Time</div>
                    <div className="metric-value">{plantKPI.P_STOP || "00:00"} Hrs</div>
                  </div>
                </div>
                <div className="metric-card purple">
                  <div className="metric-icon">⏳</div>
                  <div className="metric-content">
                    <div className="metric-label">Running Time</div>
                    <div className="metric-value">{plantKPI.P_RUN || "00:00"} Hrs</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Device Status Popup */}
      {showPopup && (
        <DeviceStatusPopup
          data={deviceStatus}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};
export default Dashboard;
