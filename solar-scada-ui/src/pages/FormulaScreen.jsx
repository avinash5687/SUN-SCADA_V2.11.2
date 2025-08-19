import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";
import "./FormulaScreen.css";

const formulaItems = [
  {
    key: "poaResult",
    title: "Cumulative POA",
    text: "Cumulative POA = (Sum(POA (W/M²))) / 60,000",
    calc: (data) => ((data.AVG_POA / 60000)).toFixed(2),
    formula: (data, val) => `(${data.AVG_POA} / 60,000) = ${val}`,
    unit: "kWh/M²",
    color: "#f39c12",
    gradient: "linear-gradient(135deg, #f39c12, #e67e22)"
  },
  {
    key: "plantAvailability",
    title: "Plant Availability",
    text: "PA = 1 - (Breakdown Min / (Today Operation Min × No of Inverter)) × 100",
    calc: (data) => ((1 - data.INV_DOWN / data.OP_COUNT) * 100).toFixed(2),
    formula: (data, val) => `1 - (${data.INV_DOWN} / ${data.OP_COUNT}) × 100 = ${val}`,
    unit: "%",
    color: "#27ae60",
    gradient: "linear-gradient(135deg, #27ae60, #2ecc71)"
  },
  {
    key: "GA",
    title: "Grid Availability",
    text: "GA = 1 - (OG Breakdown Min / Today Operation Min) × 100",
    calc: (data) => ((1 - data.OG_DOWN / data.PLANT_AVAIL) * 100).toFixed(2),
    formula: (data, val) => `1 - (${data.OG_DOWN} / ${data.PLANT_AVAIL}) × 100 = ${val}`,
    unit: "%",
    color: "#3498db",
    gradient: "linear-gradient(135deg, #3498db, #2980b9)"
  },
  {
    key: "pr",
    title: "Performance Ratio",
    text: "PR = (Total Power Generation / (Cumulative POA × Plant Capacity)) × 100",
    calc: (data) => ((data.P_EXP / (data.POA * data.DC_CAP)) * 100).toFixed(2),
    formula: (data, val) => `(${data.P_EXP} / (${data.POA} × ${data.DC_CAP})) × 100 = ${val}`,
    unit: "%",
    color: "#9b59b6",
    gradient: "linear-gradient(135deg, #9b59b6, #8e44ad)"
  },
  {
    key: "acCuf",
    title: "AC CUF",
    text: "AC CUF = (Total Power Generation / (24 × Plant AC Capacity)) × 100",
    calc: (data) => ((data.P_EXP / (24 * data.AC_CAP)) * 100).toFixed(2),
    formula: (data, val) => `(${data.P_EXP} / (24 × ${data.AC_CAP})) × 100 = ${val}`,
    unit: "%",
    color: "#e74c3c",
    gradient: "linear-gradient(135deg, #e74c3c, #c0392b)"
  },
  {
    key: "dcCuf",
    title: "DC CUF",
    text: "DC CUF = (Total Power Generation / (24 × Plant DC Capacity)) × 100",
    calc: (data) => ((data.P_EXP / (24 * data.DC_CAP)) * 100).toFixed(2),
    formula: (data, val) => `(${data.P_EXP} / (24 × ${data.DC_CAP})) × 100 = ${val}`,
    unit: "%",
    color: "#34495e",
    gradient: "linear-gradient(135deg, #34495e, #2c3e50)"
  },
];

const FormulaScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dataRef = useRef(null);

  useEffect(() => {
    const fetchData = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      
      try {
        const response = await axios.get(API_ENDPOINTS.dashboard.plantKpi);
        const newData = response.data[0];
        
        // Update data and ref simultaneously for smooth transitions
        setData(newData);
        dataRef.current = newData;
      } catch (error) {
        console.error("Failed to fetch formula data:", error);
        // Keep existing data on error, don't clear UI
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    // Initial load with loading state
    fetchData(true);
    
    // Background refresh every 30 seconds without loading state
    const intervalId = setInterval(() => fetchData(false), 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Layout>
      <div className="formula-container">
        {/* Simple Header - matching other screens */}
        <div className="formula-header">
          <h2 className="formula-title">Formulae & KPIs</h2>
        </div>

        {/* Loading State - only on initial load */}
        {loading && !data && (
          <div className="formula-loading">
            <div className="loading-spinner"></div>
            <span>Loading KPIs...</span>
          </div>
        )}

        {/* KPI Cards Grid - Always show data, update smoothly */}
        {data && (
          <div className="formula-grid">
            {formulaItems.map((item) => {
              const val = item.calc(data);
              return (
                <div 
                  className="formula-card" 
                  key={item.key}
                  style={{
                    '--card-color': item.color,
                    '--card-gradient': item.gradient
                  }}
                >
                  <div className="card-header">
                    <div className="card-title-section">
                      <h3 className="card-title">{item.title}</h3>
                      <span className="card-unit">{item.unit}</span>
                    </div>
                  </div>
                  
                  <div className="card-value">
                    <span className="main-value">{val}</span>
                  </div>
                  
                  <div className="card-formula">
                    <p className="formula-description">{item.text}</p>
                    <div className="formula-calculation">
                      {item.formula(data, val)}
                    </div>
                  </div>
                  
                  <div className="card-accent"></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error State - only if no data at all */}
        {!loading && !data && (
          <div className="formula-error">
            <span className="error-icon">⚠️</span>
            <p>Unable to load formula data</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FormulaScreen;
