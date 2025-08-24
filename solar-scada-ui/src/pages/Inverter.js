import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Inverter.css";
import inverterImage from '../assets/Sungrow_inv.png';
import { API_ENDPOINTS } from "../apiConfig";

const Inverter = () => {
  const [inverterData, setInverterData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInverterData = () => {
    axios
      .get(API_ENDPOINTS.inverter.getAll)
      .then((response) => {
        setInverterData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching inverter data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInverterData();
    const interval = setInterval(fetchInverterData, 30000);
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
      {/* Formula Screen Style Header */}
      <div className="inverter-header">
        <h2 className="inverter-title">Inverter Data Overview</h2>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="inverter-loading">
          <div className="loading-spinner"></div>
          <span>Loading inverter data...</span>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="inverter-content">
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
                          className={`status-indicator ${
                            inv.CUM_STS === 1 ? "status-green" : "status-red"
                          }`}
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
      )}
    </div>
  );
};

export default Inverter;
