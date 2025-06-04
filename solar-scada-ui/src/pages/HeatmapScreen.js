import React, { useEffect, useState } from "react";
import axios from "axios";
import Heatmap from "../components/Heatmap";

const HeatmapScreen = () => {
  const [inverterData, setInverterData] = useState([]);

  useEffect(() => {
    const fetchInverterData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/inverter/Heatmap");
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
