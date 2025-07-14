import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MFM.css";
import mfmImage from "../assets/Meter.jpg";

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000";

const MFM = () => {
  const [mfmData, setMfmData] = useState([]);
  const [plantKPI, setPlantKPI] = useState({});

  const fetchMFMData = () => {
    axios
      .get(`${API_BASE_URL}/api/mfm`)
      .then((response) => setMfmData(response.data))
      .catch((error) => console.error("Error fetching MFM data:", error));
  };

  const fetchPlantKPI = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/dashboard/plant-kpi?_=${Date.now()}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPlantKPI(res.data[0]); // assuming it's an array with 1 object
      } else {
        setPlantKPI({});
      }
    } catch (err) {
      console.error("Error fetching plant KPI", err);
      setPlantKPI({});
    }
  };

  useEffect(() => {
    fetchMFMData();
    fetchPlantKPI();
    const interval = setInterval(() => {
      fetchMFMData();
      fetchPlantKPI();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const plantKPIList = [
    { label: "Export", key: "P_EXP", unit: "kWh" },
    { label: "Import", key: "P_IMP", unit: "kWh" },
    { label: "PR", key: "PR", unit: "%" },
    { label: "POA", key: "POA", unit: "kWh/m²" },
    { label: "CUF", key: "CUF", unit: "%" },
    { label: "PA", key: "PA", unit: "%" },
    { label: "GA", key: "GA", unit: "%" },
  ];

  return (
    <div className="mfm-container">
      {/* ✅ Plant KPI Section */}
      <div className="plant-kpi-bar1">
        {plantKPIList.map(({ label, key, unit }) => (
          <div key={label} className="kpi-box1">
            <span className="kpi-label1">{label}</span>
            <span className="kpi-value1">
              {plantKPI[key] !== undefined && plantKPI[key] !== null
                ? `${parseFloat(plantKPI[key]).toFixed(2)} ${unit}`
                : "--"}
            </span>
          </div>
        ))}
      </div>
      <h2 className="mfm-title"></h2>
      <div className="mfm-table-wrapper">
        <table className="mfm-table">
          <thead>
            <tr>
              <th>Parameters</th>
              {mfmData.map((meter, index) => (
                <th key={index}>
                  <div className="mfm-header-content">
                    <img src={mfmImage} alt="MFM" className="header-mfm-image" />
                    <div className="header-text-status">
                      <span className="header-name">{meter.ICR || `MFM ${index + 1}`}</span>
                      <div
                        className={`status-indicator ${
                          meter.CUM_STS === 1 ? "status-green" : "status-red"
                        }`}
                        title={meter.CUM_STS === 1 ? "Online" : "Offline"}
                      ></div>
                    </div>
                  </div>
                </th>
              ))}
              <th>UNIT</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Timestamp", key: "Date_Time", unit: "" },
              { name: "R Phase Voltage", key: "RY_VLT", unit: "V" },
              { name: "Y Phase Voltage", key: "YB_VLT", unit: "V" },
              { name: "B Phase Voltage", key: "BR_VLT", unit: "V" },
              { name: "R Phase Current", key: "R_L_CRNT", unit: "A" },
              { name: "Y Phase Current", key: "Y_L_CRNT", unit: "A" },
              { name: "B Phase Current", key: "B_L_CRNT", unit: "A" },
              { name: "Active Power", key: "AC_PWR", unit: "kW" },
              { name: "Reactive Power", key: "RCT_PWR", unit: "kVAr" },
              { name: "Apparent Power", key: "APP_PWR", unit: "kVA" },
              { name: "Frequency", key: "FRQ", unit: "Hz" },
              { name: "Power Factor", key: "PF", unit: "" },
              { name: "Total Active Export", key: "TOT_IMP_KWh", unit: "kWh" },
              { name: "Total Active Import", key: "TOT_EXP_KWh", unit: "kWh" },
              { name: "Total Reactive Export", key: "TOT_EXP_KVArh", unit: "kVArh" },
              { name: "Total Reactive Import", key: "TOT_IMP_KVArh", unit: "kVArh" },
              { name: "Today Active Export", key: "TODAY_IMP_KWh", unit: "kWh" },
              { name: "Today Active Import", key: "TODAY_EXP_KWh", unit: "kWh" },
            ].map((param, idx) => (
              <tr key={idx}>
                <td>{param.name}</td>
                {mfmData.map((meter, index) => (
                  <td key={index}>{meter[param.key] || 0}</td>
                ))}
                <td>{param.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MFM;
