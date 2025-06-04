import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const PerformanceRatioGauge = ({ value }) => {
  const segments = 20; // Number of segments in the circle
  const filledSegments = Math.round((value / 100) * segments);
  
  const data = Array.from({ length: segments }, (_, index) => ({
    value: 1, // Equal size for all segments
    color: index < filledSegments ? "#1f77b4" : "#c6ddf3", // Blue for filled, Light blue for empty
  }));

  return (
    <div style={{ position: "relative", width: 120, height: 120 }}>
      <PieChart width={120} height={120}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={60}
          startAngle={90}
          endAngle={-270} // Full Circle
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      {/* Centered Text (PR Value) */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "18px",
        fontWeight: "bold",
        color: "#333"
      }}>
        {value}%
      </div>
    </div>
  );
};

export default PerformanceRatioGauge;
