// MFM.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MFM.css"; // All styles will come from this file
import mfmImage from '../assets/Meter.jpg'; // Make sure this path is correct
import { API_ENDPOINTS } from "../apiConfig";

const MFM = () => {
  const [mfmData, setMfmData] = useState([]);

  const fetchMFMData = () => {
    axios
      .get(API_ENDPOINTS.mfm.getAll)
      .then((response) => setMfmData(response.data))
      .catch((error) => console.error("Error fetching MFM data:", error));
  };

  useEffect(() => {
    fetchMFMData();
    const interval = setInterval(fetchMFMData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mfm-container">
      <h2 className="mfm-title">MFM Data Overview</h2>

      {/* This wrapper enables horizontal scrolling for the wide table */}
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
                        title={meter.CUM_STS === 1 ? 'Online' : 'Offline'}
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
