import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Inverter.css";
import inverterImage from '../assets/Sungrow_inv.png';
import { API_ENDPOINTS } from "../apiConfig";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Inverter = () => {
  const [inverterData, setInverterData] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState('ICR 1');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [initialChartLoad, setInitialChartLoad] = useState(true);

  // Initialize loading states for inverters
  useEffect(() => {
    const initialLoadingStates = {};
    const ids = activeTab === 'ICR 1' ? [1, 2] : [3, 4];
    ids.forEach(id => {
      initialLoadingStates[id] = true;
    });
    setLoadingStates(initialLoadingStates);
  }, [activeTab]);

  const fetchChartData = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setChartLoading(true);
      }
      const response = await axios.get(API_ENDPOINTS.inverter.chart);
      if (response.data) {
        // Sort by timestamp so Highcharts zoom/pinch keeps data visible
        const sortedData = [...response.data].sort((a, b) => new Date(a.DATE_TIME) - new Date(b.DATE_TIME));
        setChartData(sortedData);
      }
      if (initialChartLoad) {
        setInitialChartLoad(false);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      if (!isRefresh) {
        setChartLoading(false);
      }
    }
  };

  const fetchInverterData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const inverterIds = activeTab === 'ICR 1' ? [1, 2] : [3, 4];
      const API_TIMEOUT = 10000;
      const axiosConfig = { timeout: API_TIMEOUT };

      console.time('Inverter Table API Fetch');

      // Only reset loading states, not data (to prevent flickering)
      if (!isRefresh) {
        setInverterData({});
      }
      const newLoadingStates = {};
      inverterIds.forEach(id => newLoadingStates[id] = isRefresh ? false : true);
      if (!isRefresh) {
        setLoadingStates(newLoadingStates);
      }


      // Fetch each inverter data individually
      inverterIds.forEach(async (id) => {
        try {
          const response = await axios.get(API_ENDPOINTS.inverter.getAll, { 
            params: { id }, 
            ...axiosConfig 
          });
          
          if (response.data) {
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            setInverterData(prev => ({ ...prev, [id]: data }));
            setLoadingStates(prev => ({ ...prev, [id]: false }));
          }
        } catch (error) {
          console.warn(`Inverter ${id} API failed:`, error.message);
          setLoadingStates(prev => ({ ...prev, [id]: false }));
        }
      });

      // Mark initial load as complete after first attempt
      if (initialLoad) {
        setTimeout(() => setInitialLoad(false), 1000);
      }

      console.timeEnd('Inverter Table API Fetch');
      console.log('✅ Inverter table data fetch initiated for', activeTab);

    } catch (error) {
      console.error("Error fetching inverter data:", error);
      // Set all loading states to false on general error
      const errorStates = {};
      const inverterIds = activeTab === 'ICR 1' ? [1, 2] : [3, 4];
      inverterIds.forEach(id => {
        errorStates[id] = false;
      });
      setLoadingStates(errorStates);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInverterData(false);
    fetchChartData(false);
    const interval = setInterval(() => {
      fetchInverterData(true);
      fetchChartData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeTab]); // Refetch when activeTab changes

  const calculatePR = (E_Today, DC_Capacity, POA) => {
    const e = parseFloat(E_Today);
    const c = parseFloat(DC_Capacity);
    const p = parseFloat(POA);
    if (!e || !c || !p || c === 0 || p === 0) return 0;
    return ((e / (c * p)) * 100).toFixed(2);
  };

  // Skeleton components
  const SkeletonHeaderCell = ({ id }) => (
    <th className="skeleton-header-cell">
      <div className="skeleton-header-content">
        <div className="skeleton-inverter-image"></div>
        <div className="skeleton-header-text">
          <div className="skeleton-name"></div>
          <div className="skeleton-status-dot"></div>
        </div>
      </div>
    </th>
  );

  const SkeletonDataCell = () => (
    <td className="skeleton-data-cell">
      <div className="skeleton-data-content"></div>
    </td>
  );

  const ChartSkeleton = () => (
    <div className="chart-skeleton-container">
      <div className="chart-skeleton-header">
        <div className="chart-skeleton-title"></div>
      </div>
      <div className="chart-skeleton-legend">
        <div className="chart-skeleton-legend-item"></div>
        <div className="chart-skeleton-legend-item"></div>
        <div className="chart-skeleton-legend-item"></div>
        <div className="chart-skeleton-legend-item"></div>
      </div>
      <div className="chart-skeleton-body">
        <div className="chart-skeleton-grid">
          <div className="chart-skeleton-line"></div>
          <div className="chart-skeleton-line"></div>
          <div className="chart-skeleton-line"></div>
          <div className="chart-skeleton-line"></div>
          <div className="chart-skeleton-line"></div>
        </div>
        <div className="chart-skeleton-graph">
          <div className="chart-skeleton-bar"></div>
          <div className="chart-skeleton-bar"></div>
          <div className="chart-skeleton-bar"></div>
          <div className="chart-skeleton-bar"></div>
          <div className="chart-skeleton-bar"></div>
          <div className="chart-skeleton-bar"></div>
          <div className="chart-skeleton-bar"></div>
          <div className="chart-skeleton-bar"></div>
        </div>
      </div>
    </div>
  );

  // Parameters configuration
  const parameters = [
    { name: "Timestamp", key: "Date_Time", unit: "" },
    { name: "Active Power", key: "Active_Power", unit: "kW" },
    { name: "Reactive Power", key: "React_Power", unit: "kVAr" },
    { name: "DC Power", key: "DC_Power", unit: "kW" },
    { name: "DC Capacity", key: "DC_Capacity", unit: "kWp" },
    { name: "Power Factor", key: "PF", unit: "" },
    { name: "Frequency", key: "Frequency", unit: "Hz" },
    { name: "Efficiency", key: "Efficiancy", unit: "%" },
    { name: "RY Voltage", key: "Voltage_RY", unit: "kV" },
    { name: "YB Voltage", key: "Voltage_YB", unit: "kV" },
    { name: "BR Voltage", key: "Voltage_BR", unit: "kV" },
    { name: "R Current", key: "Current_R", unit: "A" },
    { name: "Y Current", key: "Current_Y", unit: "A" },
    { name: "B Current", key: "Current_B", unit: "A" },
    { name: "Today Energy", key: "E_Today", unit: "kWh" },
    { name: "Total Energy", key: "E_Total", unit: "kWh" },
    { name: "PR", key: "PR", unit: "%" },
  ];

  const inverterIds = activeTab === 'ICR 1' ? [1, 2] : [3, 4];

  // Chart parameter configuration
  const chartParams = [
    { name: 'Active Power', suffix: 'ACT_PWR', unit: 'kW', visible: true },
    { name: 'DC Power', suffix: 'DC_PWR', unit: 'kW', visible: false },
    { name: 'Apparent Power', suffix: 'APPT_PWR', unit: 'kVA', visible: false },
    { name: 'Frequency', suffix: 'FREQUENCY', unit: 'Hz', visible: false },
  ];

  // Generate series data from chart API
  const generateChartSeries = () => {
    const series = [];
    
    // Define primary colors for chart
    const primaryColors = [
      '#3498db', // Blue
      '#e74c3c', // Red
      '#2ecc71', // Green
      '#f39c12', // Orange
      '#9b59b6', // Purple
      '#1abc9c', // Turquoise
      '#34495e', // Dark Gray
      '#e67e22'  // Carrot Orange
    ];
    
    let colorIndex = 0;
    
    inverterIds.forEach(invId => {
      chartParams.forEach(param => {
        const columnName = `INV${invId}_${param.suffix}`;
        const data = chartData.map(item => [
          new Date(item.DATE_TIME).getTime(),
          item[columnName] || 0
        ]);
        
        series.push({
          name: `INV${invId} - ${param.name}`,
          data: data,
          color: primaryColors[colorIndex % primaryColors.length],
          tooltip: {
            valueSuffix: ` ${param.unit}`
          },
          visible: param.visible
        });
        
        colorIndex++;
      });
    });
    
    return series;
  };

  const chartOptions = {
    chart: {
      type: 'line',
      zoomType: 'x',
      pinchType: 'x',
      panning: {
        enabled: true,
        type: 'x'
      }
    },
    title: {
      text: null
    },
    credits: {
      enabled: false
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Time'
      }
    },
    yAxis: {
      title: {
        text: 'Value'
      }
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom'
    },
    plotOptions: {
      series: {
        events: {
          legendItemClick: function () {
            return true;
          }
        }
      }
    },
    series: generateChartSeries()
  };


  return (
    <div className="inverter-container">
      {/* Formula Screen Style Header */}
      <div className="inverter-header">
        <h2 className="inverter-title">Inverter Data Overview</h2>
        <div className="inverter-tabs">
          <button 
            className={`tab-button ${activeTab === 'ICR 1' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ICR 1')}
          >
            ICR 1
          </button>
          <button 
            className={`tab-button ${activeTab === 'ICR 2' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ICR 2')}
          >
            ICR 2
          </button>
        </div>
        {refreshing && (
          <div className="refresh-indicator">
            <div className="refresh-spinner"></div>
            <span>Refreshing...</span>
          </div>
        )}
      </div>
      <div className="inverter-main-content">
        <div className="inverter-table-container">
          {/* Loading State - Only show if all are loading initially */}
          {initialLoad && Object.values(loadingStates).every(state => state) && (
            <div className="inverter-loading">
              <div className="loading-spinner"></div>
              <span>Loading inverter data...</span>
            </div>
          )}

          {/* Main Content - Show table with skeleton/data mix */}
          {(!initialLoad || !Object.values(loadingStates).every(state => state)) && (
            <div className="inverter-content">
              <table className="inverter-table">
                <thead>
                  <tr>
                    <th>Parameters</th>
                    {inverterIds.map((id) => {
                      const isLoading = loadingStates[id];
                      const inverter = inverterData[id];

                      if (isLoading) {
                        return <SkeletonHeaderCell key={`skeleton-header-${id}`} id={id} />;
                      }

                      return (
                        <th key={id}>
                          <div className="inverter-header-content">
                            <img src={inverterImage} alt="Inverter" className="header-inverter-image" />
                            <div className="header-text-status">
                              <span className="header-name">
                                {inverter?.Name || `INV ${id}`}
                              </span>
                              <div
                                className={`status-indicator ${
                                  inverter?.CUM_STS === 1 ? "status-green" : 
                                  inverter ? "status-red" : "status-gray"
                                }`}
                                title={
                                  inverter?.CUM_STS === 1 ? 'Online' : 
                                  inverter ? 'Offline' : 'No Data'
                                }
                              ></div>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                    <th>UNIT</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param, idx) => (
                    <tr key={idx}>
                      <td>{param.name}</td>
                      {inverterIds.map((id) => {
                        const isLoading = loadingStates[id];
                        const inverter = inverterData[id];

                        if (isLoading) {
                          return <SkeletonDataCell key={`skeleton-data-${id}-${idx}`} />;
                        }

                        let value = "No Data";
                        if (inverter) {
                          if (param.key === "PR") {
                            value = calculatePR(inverter.E_Today, inverter.DC_Capacity, inverter.POA);
                          } else {
                            value = inverter[param.key] || 0;
                          }
                        }

                        return (
                          <td key={`data-${id}-${idx}`} className={!inverter ? 'no-data-cell' : ''}>
                            {value}
                          </td>
                        );
                      })}
                      <td>{param.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="inverter-graph-container">
          {chartLoading ? (
            <ChartSkeleton />
          ) : (
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Inverter;