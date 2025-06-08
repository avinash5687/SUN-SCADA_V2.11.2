import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MFM.css";

  const API_BASE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "http://103.102.234.177:5000";
const MFM = () => {
  const [mfmData, setMfmData] = useState([]);

  const fetchMFMData = () => {
    axios
      .get(`${API_BASE_URL}/api/mfm`)
      .then((response) => {
        setMfmData(response.data);
      })
      .catch((error) => console.error("Error fetching MFM data:", error));
  };

  useEffect(() => {
    // Initial data fetch
    fetchMFMData();

    // Set interval to refresh data every 30 seconds
    const interval = setInterval(fetchMFMData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mfm-container">
      <h2 className="mfm-title">MFM Data</h2>
      <table className="mfm-table">
        <thead>
          <tr>
            <th>Parameters</th>
            {mfmData.map((meter, index) => (
              <th key={index}>{meter.ICR || `MFM ${index + 1}`}</th>
            ))}
            <th>UNIT</th>
          </tr>
        </thead>
        <tbody>
          {/* Communication Status Row */}
          <tr>
            <td>Communication Status</td>
            {mfmData.map((meter, index) => (
              <td key={index} className="status-cell">
                <div
                  className={`status-indicator ${
                    meter.CUM_STS === 1 ? "status-green" : "status-red"
                  }`}
                ></div>
              </td>
            ))}
            <td></td> {/* Empty unit column */}
          </tr>

          {/* Other Parameter Rows */}
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
            { name: "Total Active Export", key: "TOT_EXP_KWh", unit: "kWh" },
            { name: "Total Active Import", key: "TOT_IMP_KWh", unit: "kWh" },
            { name: "Total Reactive Export", key: "TOT_EXP_KVArh", unit: "kVArh" },
            { name: "Total Reactive Import", key: "TOT_IMP_KVArh", unit: "kVArh" },
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
  );
};

export default MFM;
