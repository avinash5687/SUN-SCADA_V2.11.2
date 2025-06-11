// src/screens/FormulaScreen.jsx
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import FormulaBox from "../components/FormulaBox";
import axios from "axios";

  const API_BASE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "http://103.102.234.177:5000";
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
  const poaResult = ((data.AVG_POA / 1000) * parseFloat(data.P_RUN)).toFixed(2);
  const plantAvailability = (1 - data.INV_DOWN / data.OP_COUNT) * 100;
  const GA = (1 - data.OG_DOWN / data.PLANT_AVAIL) * 100;
  const pr = ((data.P_EXP / (data.POA * data.DC_CAP)) * 100).toFixed(2);
  const acCuf = ((data.P_EXP / (24 * data.AC_CAP)) * 100).toFixed(2);
  const dcCuf = ((data.P_EXP / (24 * data.DC_CAP)) * 100).toFixed(2);

  return (
    <Layout>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: "15px",
          height: "calc(100vh - 50px)", // adjust if you have header/footer
          width: "100%",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <FormulaBox
          title="SOLAR Average Irradiation"
          text="POA = (Average Radiation(Tilted)/1000) * Today Operation Hrs"
          formula={`POA = (${data.AVG_POA} / 1000) * ${data.P_RUN} = ${poaResult}`}
        />
        <FormulaBox
          title="Plant Availability (%)"
          text="PA(%) = 1 - (Breakdown Min / (Today Operation Min * No of Inverter)) * 100"
          formula={`PA(%) = 1 - (${data.INV_DOWN} / ${data.OP_COUNT}) * 100 = ${plantAvailability.toFixed(2)}%`}
        />
        <FormulaBox
          title="Grid Availability (%)"
          text="GA(%) = 1 - (OG Breakdown Min / Today Operation Min) * 100"
          formula={`GA(%) = 1 - (${data.OG_DOWN} / ${data.PLANT_AVAIL}) * 100 = ${GA.toFixed(2)}%`}
        />
        <FormulaBox
          title="Performance Ratio (%)"
          text="PR(%) = (Total Power Generation / (POA ACC * Plant Capacity)) * 100"
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
