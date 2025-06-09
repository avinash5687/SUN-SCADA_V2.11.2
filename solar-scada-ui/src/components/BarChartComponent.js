import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const BarChartComponent = ({ data }) => {
  // ✅ Explicitly convert the string value to a number before summing
  const totalGeneration = data.reduce((sum, item) => {
    const value = parseFloat(item['Energy Generated']) || 0;
    return sum + value;
  }, 0);

  return (
    <div className="bar-chart-container">
      <h6 className="generation-total">
        Day - Generation <span style={{ color: "red" }}>{totalGeneration.toFixed(2)}</span> kWh
      </h6>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="TIME" stroke="#333" />
          <YAxis stroke="#333" />
          <Tooltip />
          <Bar dataKey="Energy Generated" fill="#FF4500" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
