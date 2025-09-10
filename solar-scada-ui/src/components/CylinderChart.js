import React, { useEffect, useState } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'highcharts/highcharts-3d';
import 'highcharts/modules/cylinder';

const CylinderChart = ({ data, trendType = "day" }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getSpacingForWidth = (width) => {
    if (width <= 1229) return [5, 0, 10, -25];
    else if (width <= 1240) return [6, 6, 24, -12];
    else if (width <= 1280) return [6, 10, 22, -20];
    else if (width <= 1396) return [8, 8, 13, -20];
    else if (width <= 1440) return [10, 10, 12, -20];
    else if (width <= 1536) return [4, 10, 14, -22];
    else if (width <= 1707) return [14, 14, 20, -24];
    else if (width <= 1920) return [16, 16, 20, -26];
    else return [18, 18, 24, -28];
  };

  const getHeightForWidth = (width) => {
    if (width <= 1229) return 160;
    else if (width <= 1240) return 170;
    else if (width <= 1280) return 180;
    else if (width <= 1366) return 190;
    else if (width <= 1396) return 210;
    else if (width <= 1440) return 220;
    else if (width <= 1536) return 200;
    else if (width <= 1707) return 280;
    else if (width <= 1920) return 300;
    else return 350;
  };

  const spacing = getSpacingForWidth(windowWidth);
  const height = getHeightForWidth(windowWidth);

  // Build chart options with conditional logic for daily view
  const chartOptions = {
    chart: {
      type: "cylinder",
      options3d: {
        enabled: true,
        alpha: 5,
        beta: 5,
        depth: 50,
        viewDistance: 25,
      },
      backgroundColor: "transparent",
      height: height,
      spacing: spacing
    },
    title: { text: null },
    xAxis: trendType === "day" ? {
      // DAILY VIEW: Fixed 0-24 hour x-axis (25 categories to include hour 24)
      categories: Array.from({ length: 25 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
      title: { text: "Hour of Day" },
      labels: { 
        skew3d: true,
        rotation: 0,
        step: 2, // Show every 2nd hour (0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24)
        style: { fontSize: '10px' }
      },
      min: 0,
      max: 24, // Now we can show up to 24
      tickInterval: 2
    } : {
      // OTHER VIEWS: Use original data structure
      categories: data.map(item => item.TIME || item.Time),
      title: { text: "Time" },
      labels: { skew3d: true }
    },
    yAxis: {
      title: {
        text: "Energy Generated (MWh)",
        margin: 20,
      },
      labels: { skew3d: true },
      min: 0
    },
    tooltip: {
      formatter: function() {
        if (trendType === "day") {
          return `<b>Hour: ${this.key}</b><br/>Energy: <b>${this.y.toFixed(2)} MWh</b>`;
        } else {
          return `<b>Period: ${this.key}</b><br/>Energy: <b>${this.y.toFixed(2)} MWh</b>`;
        }
      }
    },
    plotOptions: {
      series: {
        depth: 25,
        colorByPoint: false,
        pointWidth: trendType === "day" ? 15 : undefined
      }
    },
    series: [
      {
        name: "Energy Generated",
        data: trendType === "day" ? 
          // For 25 hours (0-24), map your 24-hour data and add 0 for hour 24
          Array.from({ length: 25 }, (_, hour) => {
            if (hour === 24) return 0; // Hour 24 typically has no data
            const hourData = data.find(item => item.HourBlock === hour);
            return hourData ? parseFloat(hourData["Energy Generated"] || 0) : 0;
          }) :
          // OTHER VIEWS: Use original data mapping
          data.map(item => parseFloat(item["Energy Generated"]) || 0),
        showInLegend: false,
        color: 'red' // Red color as requested
      }
    ],
    credits: { enabled: false }
  };

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

export default CylinderChart;
