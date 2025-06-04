import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const LineChartComponent = ({ data, selectedParameter }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        
        {/* ✅ Simple Line Graph */}
        <Line type={Line} dataKey={selectedParameter} stroke="#8884d8" dot={false} strokeWidth={1} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
