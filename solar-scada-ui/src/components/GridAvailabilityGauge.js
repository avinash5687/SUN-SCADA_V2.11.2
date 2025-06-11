import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const GridAvailabilityGauge = ({ value }) => {
  const segments = 20;
  const filledSegments = Math.round((value / 100) * segments);

  const fillColor = value >= 90 ? "#008000" : "#dd112f"; // Green or Red

  const data = Array.from({ length: segments }, (_, index) => ({
    value: 1,
    color: index < filledSegments ? fillColor : "#f0f0f0", // Light gray for unfilled
  }));

  return (
    <div style={{ position: "relative", width: 120, height: 120 }}>
      <PieChart width={120} height={100}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={27}
          outerRadius={50}
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
          fontSize: "14px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        {value}%
      </div>
    </div>
  );
};

export default GridAvailabilityGauge;
