import React, { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import axios from "axios";
import "./Inverter.css";

const Inverter = () => {
  const [inverterData, setInverterData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInverterData = axios.get("http://localhost:5000/api/inverter");

    fetchInverterData
      .then((inverterRes) => {
        console.log("Inverter API response:", inverterRes.data);
        setInverterData(inverterRes.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  const calculatePR = (E_Today, DC_Capacity, POA) => {
    const e = parseFloat(E_Today);
    const c = parseFloat(DC_Capacity);
    const p = parseFloat(POA);

    console.log("calculatePR inputs:", { E_Today, DC_Capacity, POA, e, c, p });

    if (!e || !c || !p || c === 0 || p === 0) return 0;

    const result = (e / (c * p)) * 100;
    return result;
  };

  // 🔍 Manual test to verify function logic
  console.log("🔍 PR manual test:", calculatePR(100, 500, 5).toFixed(2)); // Should be 40.00

  return (
    <Container className="inverter">
      <Typography variant="h5" align="center" className="inverter-title">
        Inverter Data
      </Typography>
      <div className="table-container">
        <table className="inverter-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Active Power (kW)</th>
              <th>Reactive Power (kW)</th>
              <th>DC Power (kW)</th>
              <th>DC Capacity (kWp)</th>
              <th>PF</th>
              <th>Frequency (Hz)</th>
              <th>Efficiency (%)</th>
              <th>RY Voltage (V)</th>
              <th>YB Voltage (V)</th>
              <th>BR Voltage (V)</th>
              <th>R Current (A)</th>
              <th>Y Current (A)</th>
              <th>B Current (A)</th>
              <th>Today Energy (kWh)</th>
              <th>Total Energy (kWh)</th>
              <th>PR (%)</th>
              <th>Communication Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="18">Loading data...</td>
              </tr>
            ) : inverterData.length > 0 ? (
              inverterData.map((inverter, index) => {
                const pr = calculatePR(
                  inverter.E_Today,
                  inverter.DC_Capacity,
                  inverter.POA // Use the POA value from the inverter data
                ).toFixed(2);

                console.log(`🔎 Inverter ${inverter.Name || index} PR Inputs:`, {
                  E_Today: inverter.E_Today,
                  DC_Capacity: inverter.DC_Capacity,
                  POA: inverter.POA,
                  PR: pr,
                });

                return (
                  <tr key={index}>
                    <td>{inverter.Name || "Inverter Name"}</td>
                    <td>{inverter.Active_Power || 0}</td>
                    <td>{inverter.Reactive_Power || 0}</td>
                    <td>{inverter.DC_Power || 0}</td>
                    <td>{inverter.DC_Capacity || 0}</td>
                    <td>{inverter.PF || "10 %"}</td>
                    <td>{inverter.Frequency || 0}</td>
                    <td>{inverter.Efficiancy || 0}</td>
                    <td>{inverter.Voltage_RY || 0}</td>
                    <td>{inverter.Voltage_YB || 0}</td>
                    <td>{inverter.Voltage_BR || 0}</td>
                    <td>{inverter.Current_R || 0}</td>
                    <td>{inverter.Current_Y || 0}</td>
                    <td>{inverter.Current_B || 0}</td>
                    <td>{inverter.E_Today || 0}</td>
                    <td>{inverter.E_Total || 0}</td>
                    <td>{pr}</td>
                    <td className="status-cell">
                      <div
                        className={`status-indicator ${
                          inverter.CUM_STS === 1 ? "status-green" : "status-red"
                        }`}
                      ></div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="18">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export default Inverter;
