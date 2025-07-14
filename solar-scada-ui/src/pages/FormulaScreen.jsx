// src/screens/FormulaScreen.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import FormulaBox from "../components/FormulaBox";
import axios from "axios";
import "./CustomTrend.css"; // assuming KPI bar styles are here

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000";

const plantKPIList = [
  { label: "Export", key: "P_EXP", unit: "kWh" },
  { label: "Import", key: "P_IMP", unit: "kWh" },
  { label: "PR", key: "PR", unit: "%" },
  { label: "POA", key: "POA", unit: "kWh/m²" },
  { label: "CUF", key: "CUF", unit: "%" },
  { label: "PA", key: "PA", unit: "%" },
  { label: "GA", key: "GA", unit: "%" },
];

const FormulaScreen = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      axios
        .get(`${API_BASE_URL}/api/dashboard/plant-kpi`)
        .then((response) => {
          setData(response.data[0]);
        })
        .catch((error) => {
          console.error("Failed to fetch formula data:", error);
        });
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  if (!data)
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );

  // Calculations
  const poaResult = (data.AVG_POA / 60000).toFixed(2);
  const plantAvailability = ((1 - data.INV_DOWN / data.OP_COUNT) * 100).toFixed(2);
  const GA = ((1 - data.OG_DOWN / data.PLANT_AVAIL) * 100).toFixed(2);
  const pr = ((data.P_EXP / (data.POA * data.DC_CAP)) * 100).toFixed(2);
  const acCuf = ((data.P_EXP / (24 * data.AC_CAP)) * 100).toFixed(2);
  const dcCuf = ((data.P_EXP / (24 * data.DC_CAP)) * 100).toFixed(2);

  return (
    <Layout>
      {/* ✅ KPI BAR at the top */}
      <div className="plant-kpi-bar1">
        {plantKPIList.map(({ label, key, unit }) => (
          <div key={label} className="kpi-box1">
            <span className="kpi-label1">{label}</span>
            <span className="kpi-value1">
              {data[key] !== undefined && data[key] !== null
                ? `${parseFloat(data[key]).toFixed(2)} ${unit}`
                : "--"}
            </span>
          </div>
        ))}
      </div>

      {/* ✅ Formula Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: "15px",
          height: "calc(100vh - 50px)",
          width: "100%",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <FormulaBox
          title="Cumulative POA (kWh/M²)"
          text="Cumulative POA(kWh/M²)= (Sum(POA (W/M²))) / 60,000"
          formula={`Cumulative POA(kWh/M²) = (${data.AVG_POA} / 60,000)  = ${poaResult}`}
        />
        <FormulaBox
          title="Plant Availability (%)"
          text="PA(%) = 1 - (Breakdown Min / (Today Operation Min * No of Inverter)) * 100"
          formula={`PA(%) = 1 - (${data.INV_DOWN} / ${data.OP_COUNT}) * 100 = ${plantAvailability}%`}
        />
        <FormulaBox
          title="Grid Availability (%)"
          text="GA(%) = 1 - (OG Breakdown Min / Today Operation Min) * 100"
          formula={`GA(%) = 1 - (${data.OG_DOWN} / ${data.PLANT_AVAIL}) * 100 = ${GA}%`}
        />
        <FormulaBox
          title="Performance Ratio (%)"
          text="PR(%) = (Total Power Generation / (Cumulative POA * Plant Capacity)) * 100"
          formula={`PR (%) = (${data.P_EXP} / (${data.POA} * ${data.DC_CAP})) * 100 = ${pr}%`}
        />
        <FormulaBox
          title="AC CUF (%)"
          text="AC CUF (%) = (Total Power Generation / (24 * Plant AC Capacity)) * 100"
          formula={`AC CUF (%) = (${data.P_EXP} / (24 * ${data.AC_CAP})) * 100 = ${acCuf}%`}
        />
        <FormulaBox
          title="DC CUF (%)"
          text="DC CUF (%) = (Total Power Generation / (24 * Plant DC Capacity)) * 100"
          formula={`DC CUF (%) = (${data.P_EXP} / (24 * ${data.DC_CAP})) * 100 = ${dcCuf}%`}
        />
      </div>
    </Layout>
  );
};

export default FormulaScreen;
