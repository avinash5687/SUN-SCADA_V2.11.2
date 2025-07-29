import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { API_ENDPOINTS } from "../apiConfig";
import "./CustomTrend.css";

// Primary and secondary color palettes (distinct, visible, no white)
const PRIMARY_COLORS = [
  '#1976D2', // Blue
  '#E53935', // Red
  '#43A047', // Green
  '#FB8C00', // Orange
  '#8E24AA', // Purple
  '#00897B', // Teal
  '#6D4C41', // Brown
];

const SECONDARY_COLORS = [
  '#3949AB', // Indigo
  '#FDD835', // Yellow (dark)
  '#D81B60', // Pink
  '#00ACC1', // Cyan
  '#F4511E', // Deep Orange
  '#7CB342', // Light Green
  '#C0CA33', // Lime
  '#5E35B1', // Deep Purple
  '#039BE5', // Light Blue
];

// Shuffle helper to randomize color order
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
      setShowForm(false);  // hide form after data fetched
    } catch (error) {
      console.error("Fetch trend data error:", error);
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

  // Build dynamic yAxis and series
  const allColumns = [
    ...selectedColumns1.map(col => ({ table: selectedTable1, column: col })),
    ...selectedColumns2.map(col => ({ table: selectedTable2, column: col }))
  ];

  // Combine and shuffle primary and secondary colors
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
      height: chartHeight
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
        <h2 style={{ fontSize: '20px' }}>📈 Custom Trend Analysis</h2>
        {showForm && (
          <div className="form-grid">
            <div className="input-group">
              <label>Select Table 1:</label>
              <select value={selectedTable1} onChange={(e) => setSelectedTable1(e.target.value)}>
                <option value="">-- Select Table --</option>
                {tables.map(table => <option key={table} value={table}>{table}</option>)}
              </select>
            </div>

            {selectedTable1 && (
              <div className="input-group">
                <label>Select Columns for Table 1:</label>
                <select multiple value={selectedColumns1} onChange={(e) =>
                  setSelectedColumns1([...e.target.selectedOptions].map(o => o.value))
                }>
                  {columns1.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            )}

            <div className="input-group">
              <label>Select Table 2 (Optional):</label>
              <select value={selectedTable2} onChange={(e) => setSelectedTable2(e.target.value)}>
                <option value="">-- Select Table --</option>
                {tables.map(table => <option key={table} value={table}>{table}</option>)}
              </select>
            </div>

            {selectedTable2 && (
              <div className="input-group">
                <label>Select Columns for Table 2:</label>
                <select multiple value={selectedColumns2} onChange={(e) =>
                  setSelectedColumns2([...e.target.selectedOptions].map(o => o.value))
                }>
                  {columns2.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            )}

            <div className="input-group">
              <label>Start Date:</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="input-group">
              <label>End Date:</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        )}
        <div className={`button-group ${selectedTable2 ? '' : 'single-table'}`}>
          {!trendData.length && (
            <button onClick={fetchTrendData} className="primary">📊 Show Trend</button>
          )}
          {trendData.length > 0 && (
            <button onClick={exportCSV} className="secondary">📥 Export CSV</button>
          )}
          <button onClick={() => window.location.reload()} className="secondary">🔄 Reload Page</button>
        </div>

        {trendData.length > 0 && (
          <div className="chart-container">
            <h3>Trend Graph</h3>
            <HighchartsReact
              highcharts={Highcharts}
              options={chartOptions}
              containerProps={{ style: { height: "100%", width: "100%" } }}
              ref={chartRef}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomTrend;
