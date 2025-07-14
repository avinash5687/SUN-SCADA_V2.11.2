import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Inverter.css";
import inverterImage from '../assets/Sungrow_inv.png';

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000";

const Inverter = () => {
  const [inverterData, setInverterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantKPI, setPlantKPI] = useState({});

  const fetchInverterData = () => {
    axios
      .get(`${API_BASE_URL}/api/inverter`)
      .then((response) => {
        setInverterData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inverter data:", error);
        setLoading(false);
      });
  };

const fetchPlantKPI = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/api/dashboard/plant-kpi?_=${Date.now()}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      setPlantKPI(res.data[0]);  // ✅ Use first object from array
    } else {
      setPlantKPI({});
    }
  } catch (err) {
    console.error("Error fetching plant KPI", err);
    setPlantKPI({});
  }
};

  useEffect(() => {
    fetchInverterData();
    fetchPlantKPI();
    const interval = setInterval(() => {
      fetchInverterData();
      fetchPlantKPI();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculatePR = (E_Today, DC_Capacity, POA) => {
    const e = parseFloat(E_Today);
    const c = parseFloat(DC_Capacity);
    const p = parseFloat(POA);
    if (!e || !c || !p || c === 0 || p === 0) return 0;
    return ((e / (c * p)) * 100).toFixed(2);
  };

  return (
    <div className="inverter-container">
      {/* KPI BAR */}
      <div className="plant-kpi-bar1">
        {[
          { label: 'Export', key: 'P_EXP', unit: 'kWh' },
          { label: 'Import', key: 'P_IMP', unit: 'kWh' },
          { label: 'PR', key: 'PR', unit: '%' },
          { label: 'POA', key: 'POA', unit: 'kWh/m²' },
          { label: 'CUF', key: 'CUF', unit: '%' },
          { label: 'PA', key: 'PA', unit: '%' },
          { label: 'GA', key: 'GA', unit: '%' },
         ].map(({ label, key, unit }) => (
          <div key={label} className="kpi-box1">
            <span className="kpi-label1">{label}</span>
            <span className="kpi-value1">
              {plantKPI[key] !== undefined ? parseFloat(plantKPI[key]).toFixed(2) : '--'} {unit}
            </span>
          </div>
        ))}
      </div>
      <h2 className="inverter-title"></h2>
      <table className="inverter-table">
        <thead>
          <tr>
            <th>Parameters</th>
            {inverterData.map((inv, idx) => (
              <th key={idx}>
                <div className="inverter-header-content">
                  <img src={inverterImage} alt="Inverter" className="header-inverter-image" />
                  <div className="header-text-status">
                    <span className="header-name">{inv.Name || `INV ${idx + 1}`}</span>
                    <div
                      className={`status-indicator ${inv.CUM_STS === 1 ? "status-green" : "status-red"}`}
                      title={inv.CUM_STS === 1 ? 'Online' : 'Offline'}
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
          ].map((param, idx) => (
            <tr key={idx}>
              <td>{param.name}</td>
              {inverterData.map((inv, i) => (
                <td key={i}>
                  {param.key === "PR"
                    ? calculatePR(inv.E_Today, inv.DC_Capacity, inv.POA)
                    : inv[param.key] || 0}
                </td>
              ))}
              <td>{param.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inverter;
