import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { API_ENDPOINTS } from "../apiConfig";
import "./CustomTrend.css";
import Assessment from '@mui/icons-material/Assessment';
import TrendingUp from '@mui/icons-material/TrendingUp';
import DateRange from '@mui/icons-material/DateRange';
import Refresh from '@mui/icons-material/Refresh';
import ArrowBack from '@mui/icons-material/ArrowBack';
import Download from '@mui/icons-material/Download';

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange, placeholder = "-- Choose Table --" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const displayValue = value || placeholder;

  return (
    <div className="custom-select-wrapper" ref={dropdownRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? '#2c3e50' : '#95a5a6', fontStyle: value ? 'normal' : 'italic' }}>
          {displayValue}
        </span>
      </div>
      <div className={`custom-select-options ${isOpen ? 'open' : ''}`}>
        <div 
          className="custom-select-option disabled"
          onClick={() => handleSelect("")}
        >
          {placeholder}
        </div>
        {options.map((option) => (
          <div
            key={option}
            className={`custom-select-option ${value === option ? 'selected' : ''}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

// Primary and secondary color palettes
const PRIMARY_COLORS = [
  '#1976D2', '#E53935', '#43A047', '#FB8C00', '#8E24AA', '#00897B', '#6D4C41',
];

const SECONDARY_COLORS = [
  '#3949AB', '#FDD835', '#D81B60', '#00ACC1', '#F4511E', '#7CB342', '#C0CA33', '#5E35B1', '#039BE5',
];

function shuffle(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const CustomTrend = () => {
  const [tables, setTables] = useState([]);
  const [columns1, setColumns1] = useState([]);
  const [columns2, setColumns2] = useState([]);
  const [selectedTable1, setSelectedTable1] = useState("");
  const [selectedTable2, setSelectedTable2] = useState("");
  const [selectedColumns1, setSelectedColumns1] = useState([]);
  const [selectedColumns2, setSelectedColumns2] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);
  const [chartHeight, setChartHeight] = useState(getChartHeight());
  const [showForm, setShowForm] = useState(true);

  function getChartHeight() {
    const width = window.innerWidth;
    if (width <= 1230) return 440;
    if (width <= 1280) return 440;
    if (width <= 1396) return 500;
    if (width <= 1440) return 500;
    if (width <= 1536) return 590;
    if (width <= 1707) return 670;
    if (width <= 1920) return 750;
    return 840;
  }

  useEffect(() => {
    const handleResize = () => setChartHeight(getChartHeight());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    axios.get(API_ENDPOINTS.customTrend.getTables)
      .then((res) => setTables(res.data))
      .catch((err) => console.error("Tables fetch error:", err));
  }, []);

  useEffect(() => {
    if (selectedTable1) {
      axios.get(API_ENDPOINTS.customTrend.getColumns(selectedTable1))
        .then((res) => setColumns1(res.data))
        .catch((err) => console.error("Columns1 fetch error:", err));
    }
  }, [selectedTable1]);

  useEffect(() => {
    if (selectedTable2) {
      axios.get(API_ENDPOINTS.customTrend.getColumns(selectedTable2))
        .then((res) => setColumns2(res.data))
        .catch((err) => console.error("Columns2 fetch error:", err));
    }
  }, [selectedTable2]);

  const fetchTrendData = async () => {
    if (!selectedTable1 || selectedColumns1.length === 0 || !startDate || !endDate) {
      alert("Please select at least one table, columns, and date range!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(API_ENDPOINTS.customTrend.getTableData, {
        table1: selectedTable1,
        columns1: selectedColumns1,
        table2: selectedTable2,
        columns2: selectedColumns2,
        startDate,
        endDate
      });

      const formatted = res.data.map(row => {
        const newRow = { Date_Time: row.Date_Time };
        selectedColumns1.forEach(col => {
          newRow[`${selectedTable1}_${col}`] = row[col];
        });
        selectedColumns2.forEach(col => {
          newRow[`${selectedTable2}_${col}`] = row[col];
        });
        return newRow;
      });

      setTrendData(formatted);
      setShowForm(false);
    } catch (error) {
      console.error("Fetch trend data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    if (!selectedTable1 || selectedColumns1.length === 0 || !startDate || !endDate) {
      alert("Please select table, columns, and date range!");
      return;
    }

    try {
      const res = await axios.post(API_ENDPOINTS.customTrend.exportCsv, {
        table1: selectedTable1,
        columns1: selectedColumns1,
        table2: selectedTable2,
        columns2: selectedColumns2,
        startDate,
        endDate
      }, { responseType: "blob" });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `Trend_${selectedTable1}_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(a);
      a.click();
    } catch (error) {
      console.error("Export CSV error:", error);
    }
  };

  const goBackToForm = () => {
    setShowForm(true);
    setTrendData([]);
  };

  const allColumns = [
    ...selectedColumns1.map(col => ({ table: selectedTable1, column: col })),
    ...selectedColumns2.map(col => ({ table: selectedTable2, column: col }))
  ];

  const colorList = [...shuffle(PRIMARY_COLORS), ...shuffle(SECONDARY_COLORS)];

  const yAxis = allColumns.map((colObj, index) => ({
    title: { text: `${colObj.column}` },
    opposite: index % 2 !== 0,
    lineColor: colorList[index % colorList.length],
    labels: {
      style: {
        color: colorList[index % colorList.length]
      }
    }
  }));

  const series = allColumns.map((colObj, index) => ({
    name: `${colObj.column}`,
    data: trendData.map(row => [new Date(row.Date_Time).getTime(), row[`${colObj.table}_${colObj.column}`]]),
    yAxis: index,
    color: colorList[index % colorList.length],
    marker: { enabled: false }
  }));

  const chartOptions = {
    chart: {
      type: 'line',
      animation: { duration: 1000 },
      zoomType: 'x',
      height: chartHeight,
      spacingTop: 10,
      spacingBottom: 15,
      spacingLeft: 10,
      spacingRight: 10
    },
    title: { text: '' },
    xAxis: {
      type: 'datetime',
      title: { text: 'Time' }
    },
    yAxis,
    tooltip: {
      shared: true,
      xDateFormat: '%d-%b %Y %H:%M'
    },
    legend: {
      layout: 'horizontal',
      align: 'center',
      verticalAlign: 'bottom'
    },
    credits: { enabled: false },
    series
  };

  return (
    <Layout>
      <div className="trend-container">
        <div className="trend-header">
          <h2 className="trend-title">Custom Trend Analysis</h2>
        </div>

        {loading && (
          <div className="trend-loading">
            <div className="loading-spinner"></div>
            <span>Loading trend data...</span>
          </div>
        )}

        {!loading && (
          <div className="trend-content">
            {showForm && (
              <div className="trend-form-section">
                <div className="compact-form-grid">
                  <div className="input-group">
                    <label><Assessment /> Select Primary Table:</label>
                    <CustomDropdown
                      options={tables}
                      value={selectedTable1}
                      onChange={setSelectedTable1}
                      placeholder="-- Choose Table --"
                    />
                  </div>

                  {selectedTable1 && (
                    <div className="input-group">
                      <label><TrendingUp /> Select Columns for {selectedTable1}:</label>
                      <select 
                        multiple 
                        value={selectedColumns1} 
                        onChange={(e) =>
                          setSelectedColumns1([...e.target.selectedOptions].map(o => o.value))
                        }
                        className="compact-select compact-multi-select"
                      >
                        {columns1.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                      <span className="helper-text">Hold Ctrl/Cmd to select multiple</span>
                    </div>
                  )}

                  <div className="input-group">
                    <label><Assessment /> Select Secondary Table (Optional):</label>
                    <CustomDropdown
                      options={tables}
                      value={selectedTable2}
                      onChange={setSelectedTable2}
                      placeholder="-- Choose Table --"
                    />
                  </div>

                  {selectedTable2 && (
                    <div className="input-group">
                      <label><TrendingUp /> Select Columns for {selectedTable2}:</label>
                      <select 
                        multiple 
                        value={selectedColumns2} 
                        onChange={(e) =>
                          setSelectedColumns2([...e.target.selectedOptions].map(o => o.value))
                        }
                        className="compact-select compact-multi-select"
                      >
                        {columns2.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                      <span className="helper-text">Hold Ctrl/Cmd to select multiple</span>
                    </div>
                  )}

                  <div className="input-group">
                    <label><DateRange /> Start Date:</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="compact-input"
                    />
                  </div>

                  <div className="input-group">
                    <label><DateRange /> End Date:</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="compact-input"
                    />
                  </div>
                </div>

                <div className="button-group">
                  <button onClick={fetchTrendData} className="primary-btn">
                    <Assessment /> Generate Trend
                  </button>
                  <button onClick={() => window.location.reload()} className="secondary-btn">
                    <Refresh /> Reset Form
                  </button>
                </div>
              </div>
            )}

            {trendData.length > 0 && (
              <div className="chart-section">
                <div className="chart-header">
                  <h3 className="chart-title">Trend Analysis Results</h3>
                  <div className="chart-header-buttons">
                    <button onClick={goBackToForm} className="back-btn">
                      <ArrowBack /> Go Back to Main Page
                    </button>
                    <button onClick={exportCSV} className="export-btn">
                      <Download /> Export CSV
                    </button>
                  </div>
                </div>
                <div className="chart-container">
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={chartOptions}
                    containerProps={{ style: { height: "100%", width: "100%" } }}
                    ref={chartRef}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomTrend;