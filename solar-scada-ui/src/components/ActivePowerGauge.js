import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const ActivePowerGauge = ({ value }) => {
  const maxValue = 16; // Maximum value for the gauge
  const segments = 20; // Number of segments in the circle
  const filledSegments = Math.round((value / maxValue) * segments);

  // Create data for the segments
  const data = Array.from({ length: segments }, (_, index) => ({
    value: 1, // Equal size for all segments
    color: index < filledSegments ? "#d4500d" : "#f37c20", // Blue for filled, Light blue for empty
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
          paddingAngle={0} // No gap between segments
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>

      {/* Centered Text (Active Power Value) */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#333"
      }}>
        {value} MW
      </div>
    </div>
  );
};

export default ActivePowerGauge;
