import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const PerformanceRatioGauge = ({ value }) => {
  const segments = 20;
  const filledSegments = Math.round((value / 100) * segments);

  // Determine fill color based on value
  let fillColor = "#008000"; // Green by default
  if (value < 70) {
    fillColor = "#dd112f"; // Red
  } else if (value >= 70 && value <= 80) {
    fillColor = "#fbd202"; // Yellow
  }

  const data = Array.from({ length: segments }, (_, index) => ({
    value: 1,
    color: index < filledSegments ? fillColor : "#e0e0e0", // Gray for empty segments
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
          endAngle={-270}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      {/* Centered Text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "18px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {value}%
      </div>
    </div>
  );
};

export default PerformanceRatioGauge;
