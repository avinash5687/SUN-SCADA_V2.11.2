import React, { useEffect, useState } from "react";
import axios from "axios";
import Heatmap from "../components/Heatmap";

  const API_BASE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "http://103.102.234.177:5000";
const HeatmapScreen = () => {
  const [inverterData, setInverterData] = useState([]);

  useEffect(() => {
    const fetchInverterData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/inverter/Heatmap`);
        setInverterData(response.data);
      } catch (error) {
        console.error("Error fetching inverter data:", error);
      }
    };

    fetchInverterData(); // Initial fetch

    const intervalId = setInterval(fetchInverterData, 30000); // Every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div>
      {inverterData.length > 0 ? (
        <Heatmap data={inverterData} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default HeatmapScreen;
