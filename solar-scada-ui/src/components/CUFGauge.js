import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const CUFGauge = ({ value }) => {
  const segments = 20;
  const filledSegments = Math.round((value / 25) * segments); // Adjust max as needed (25 if 100% = 25 CUF)

  // Determine color based on value
  let fillColor = "#008000"; // Default: green
  if (value < 15) {
    fillColor = "#dd112f"; // Red
  } else if (value >= 15 && value <= 20) {
    fillColor = "#fbd202"; // Yellow
  }

  const data = Array.from({ length: segments }, (_, index) => ({
    value: 1,
    color: index < filledSegments ? fillColor : "#f0f0f0", // Light gray for unfilled
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
          fontSize: "16px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {value}%
      </div>
    </div>
  );
};

export default CUFGauge;
