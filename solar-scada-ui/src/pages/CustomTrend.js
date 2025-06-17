import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "./CustomTrend.css";

const BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000";


const API_BASE_URL = `${BASE_URL}/api/custom-trend`;

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
   const chartRef = useRef(null);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/getTables`)
      .then((response) => setTables(response.data))
      .catch((error) => console.error("Error fetching tables:", error));
  }, []);

  useEffect(() => {
    if (selectedTable1) {
      axios
        .get(`${API_BASE_URL}/getColumns/${selectedTable1}`)
        .then((response) => setColumns1(response.data))
        .catch((error) => console.error("Error fetching columns:", error));
    }
  }, [selectedTable1]);

  useEffect(() => {
    if (selectedTable2) {
      axios
        .get(`${API_BASE_URL}/getColumns/${selectedTable2}`)
        .then((response) => setColumns2(response.data))
        .catch((error) => console.error("Error fetching columns:", error));
    }
  }, [selectedTable2]);

  const fetchTrendData = async () => {
    if (!selectedTable1 || selectedColumns1.length === 0 || !startDate || !endDate) {
      alert("Please select at least one table, columns, and date range!");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/getTableData`, {
        table1: selectedTable1,
        columns1: selectedColumns1,
        table2: selectedTable2,
        columns2: selectedColumns2,
        startDate,
        endDate,
      });

      // Format the data to include table names in the keys
      const formattedData = response.data.map((item) => {
        const newItem = { Date_Time: item.Date_Time };
        selectedColumns1.forEach((col) => {
          newItem[`${selectedTable1}_${col}`] = item[col];
        });
        selectedColumns2.forEach((col) => {
          newItem[`${selectedTable2}_${col}`] = item[col];
        });
        return newItem;
      });

      setTrendData(formattedData);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    }
  };

  const exportCSV = async () => {
    if (!selectedTable1 || selectedColumns1.length === 0 || !startDate || !endDate) {
      alert("Please select table, columns, and date range!");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/exportCSV`,
        {
          table1: selectedTable1,
          columns1: selectedColumns1,
          table2: selectedTable2,
          columns2: selectedColumns2,
          startDate,
          endDate,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Trend_${selectedTable1}_${startDate}_to_${endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };
 

  const getChartHeight = () => {
    const width = window.innerWidth;
    if (width <= 1230) return 200;
    if (width <= 1280) return 155;
    if (width <= 1396) return 210;
    if (width <= 1440) return 220;
    if (width <= 1536) return 230;
    if (width <= 1707) return 320;
    if (width <= 1920) return 420;
    return 440;
  };
  
  const [chartHeight, setChartHeight] = useState(getChartHeight());

  useEffect(() => {
    const handleResize = () => setChartHeight(getChartHeight());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const options = {
    chart: {
      type: 'line',
      animation: { duration: 1000 },
      zoomType: 'x',
      animation: { duration: 1000 },
    height: chartHeight // or '100%' if the parent container controls the height
      // spacing: [10, 10, 10, 10]
    },
    title: {
      text: ''
    },
    xAxis: {
      type: 'datetime',
      title: { text: 'Date' }
    },
    yAxis: {
      title: { text: 'Value' },
      lineWidth: 1,
      tickWidth: 2,
      gridLineWidth: 0
 
    },
    tooltip: {
      shared: true,
      xDateFormat: '%d-%b %Y %H:%M'
    },
    series:[
      ...selectedColumns1.map(col => ({
        name: `${selectedTable1}_${col}`,
        data: trendData.map(item => [item.Date_Time, item[`${selectedTable1}_${col}`]]),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        animation: { duration: 1000 }
      })),
      ...selectedColumns2.map(col => ({
        name: `${selectedTable2}_${col}`,
        data: trendData.map(item => [item.Date_Time, item[`${selectedTable2}_${col}`]]),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        animation: { duration: 1000 }
      }))
    ],
    credits: { enabled: false }
  };
  
  

  return (
    <Layout>
      <div className="trend-container">
        <h2 style={{ fontSize: '20px' }}>📈 Custom Trend Analysis</h2>
        <div className="form-grid">
          <div className="input-group">
            <label>Select Table 1:</label>
            <select
              value={selectedTable1}
              onChange={(e) => setSelectedTable1(e.target.value)}
            >
              <option value="">-- Select Table --</option>
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>


          {selectedTable1 && (
            <div className="input-group">
              <label>Select Columns for Table 1:</label>
              <select
                multiple
                value={selectedColumns1}
                onChange={(e) =>
                  setSelectedColumns1(
                    [...e.target.selectedOptions].map((o) => o.value)
                  )
                }
              >
                {columns1.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <label>Select Table 2 (Optional):</label>
            <select
              value={selectedTable2}
              onChange={(e) => setSelectedTable2(e.target.value)}
            >
              <option value="">-- Select Table --</option>
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>

          {selectedTable2 && (
            <div className="input-group">
              <label>Select Columns for Table 2:</label>
              <select
                multiple
                value={selectedColumns2}
                onChange={(e) =>
                  setSelectedColumns2(
                    [...e.target.selectedOptions].map((o) => o.value)
                  )
                }
              >
                {columns2.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="input-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>


          <div className={`button-group ${selectedTable2 ? '' : 'single-table'}`}>
            <button onClick={fetchTrendData} className="primary">📊 Show Trend</button>
            <button onClick={exportCSV} className="secondary">📥 Export CSV</button>
            <button onClick={() => window.location.reload()} className="secondary">🔄 Reload Page</button>
          </div>
        </div>

        {trendData.length > 0 && (
          <div className="chart-container">
            <h3>Trend Graph</h3>
           

<HighchartsReact
      highcharts={Highcharts}
      options={options}
      containerProps={{ style: { height: "100%", width: "100%" } }} 
    />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomTrend;
