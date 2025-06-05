import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const ActivePowerGauge = ({ value }) => {
  const maxValue = 21;
  const segments = 20;
  const filledSegments = Math.round((value / maxValue) * segments);

  // Determine color based on value
  let fillColor = "#008000"; // Green
  if (value <= 10) {
    fillColor = "#dd112f"; // Red
  } else if (value > 10 && value <= 15) {
    fillColor = "#fbd202"; // Yellow
  }

  const data = Array.from({ length: segments }, (_, index) => ({
    value: 1,
    color: index < filledSegments ? fillColor : "#f0f0f0", // Gray for unfilled
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
          paddingAngle={0}
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
        {value} MW
      </div>
    </div>
  );
};

export default ActivePowerGauge;
