import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ data }) => {
  // ✅ Calculate total generation
  const totalGeneration = data.reduce((sum, item) => sum + (item.energyGenerated || 0), 0);

  return (
    <div className="bar-chart-container">
      {/* ✅ Total Generation Display */}
      <h6 className="generation-total">
        Day - Generation <span style={{ color: "red" }}>{totalGeneration.toFixed(2)}</span> kWh
      </h6>
      <ResponsiveContainer width="100%" height={140}> {/* Reduced height */}
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}> {/* Adjusted margins */}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="TIME" stroke="#333" />
          <YAxis stroke="#333" />
          <Tooltip />
          <Bar dataKey="energyGenerated" fill="#FF4500" barSize={20} /> {/* Reduced bar size */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
