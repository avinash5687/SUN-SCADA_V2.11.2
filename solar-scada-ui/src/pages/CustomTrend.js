import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Layout from "../components/Layout";
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

  return (
    <Layout>
      <div className="trend-container">
        <h2>📈 Custom Trend Analysis</h2>

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

        <div className="button-group">
          <button onClick={fetchTrendData}>📊 Show Trend</button>
          <button onClick={exportCSV}>📥 Export CSV</button>
          <button onClick={() => window.location.reload()}>🔄 Reload Page</button>
        </div>

        {trendData.length > 0 && (
          <div className="chart-container">
            <h3>Trend Graph</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <XAxis dataKey="Date_Time" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedColumns1.map((col) => (
                  <Line
                    key={`${selectedTable1}_${col}`}
                    type="monotone"
                    dataKey={`${selectedTable1}_${col}`}
                    stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                    name={`${selectedTable1}_${col}`}
                  />
                ))}
                {selectedColumns2.map((col) => (
                  <Line
                    key={`${selectedTable2}_${col}`}
                    type="monotone"
                    dataKey={`${selectedTable2}_${col}`}
                    stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
                    name={`${selectedTable2}_${col}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomTrend;
