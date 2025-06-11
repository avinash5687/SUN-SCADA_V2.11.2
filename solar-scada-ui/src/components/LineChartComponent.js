import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Brush
} from "recharts";

const LineChartComponent = ({ data, onZoomChange }) => {
  // Normalize data if necessary
  const normalizedData = data.map(entry => ({
    ...entry,
    POA: entry.POA,
    ACTIVE_POWER: entry.ACTIVE_POWER,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={normalizedData}>
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="Date_Time" />

        {/* YAxis for POA */}
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#ff7300"
          domain={[0, 1200]} // Set domain for POA
        />

        {/* YAxis for ACTIVE_POWER */}
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#387908"
          domain={[0, 14000]} // Set domain for ACTIVE_POWER
        />

        <Tooltip />
        <Legend 
         verticalAlign="bottom" 
         align="center"
         wrapperStyle={{ paddingBottom: 15 }} />

        {/* Line for POA */}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="POA"
          stroke="#ff7300"
          strokeWidth={2}
          dot={false}
        />

        {/* Line for ACTIVE_POWER */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="ACTIVE_POWER"
          stroke="#387908"
          strokeWidth={2}
          dot={false}
        />

        {/* Brush for Zooming */}
        <Brush
          dataKey="Date_Time"
          height={20}
          stroke="#8884d8"
          onMouseDown={() => onZoomChange(true)}
          onMouseUp={() => onZoomChange(false)}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;
