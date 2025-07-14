import React, { useEffect, useState } from "react";
import axios from "axios";
import Heatmap from "../components/Heatmap";

const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "http://103.102.234.177:5000";

const HeatmapScreen = () => {
  const [inverterData, setInverterData] = useState([]);
  const [plantKPI, setPlantKPI] = useState({});

  const fetchInverterData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/inverter/Heatmap`);
      setInverterData(response.data || []);
    } catch (error) {
      console.error("Error fetching inverter data:", error);
    }
  };

  const fetchPlantKPI = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dashboard/plant-kpi?_=${Date.now()}`);
      setPlantKPI(response.data?.[0] || {}); // 👈 FIXED HERE
    } catch (error) {
      console.error("Error fetching plant KPI:", error);
    }
  };

  useEffect(() => {
    fetchInverterData();
    fetchPlantKPI();

    const intervalId = setInterval(() => {
      fetchInverterData();
      fetchPlantKPI();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {inverterData.length > 0 ? (
        <Heatmap data={inverterData} plantKPI={plantKPI} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default HeatmapScreen;
