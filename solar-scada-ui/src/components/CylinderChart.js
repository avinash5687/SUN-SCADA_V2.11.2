import React, { useEffect, useState } from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import 'highcharts/highcharts-3d';
import 'highcharts/modules/cylinder';

const CylinderChart = ({ data }) => {
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

  // OPTIMIZED HEIGHT VALUES for better fit on smaller resolutions
  const getHeightForWidth = (width) => {
    if (width <= 1229) return 160;        // Reduced from 220 to 160 (smaller screens)
    else if (width <= 1240) return 170;   // Reduced from 240 to 170 
    else if (width <= 1280) return 180;   // Reduced from 250 to 180 (1280x720 resolution)
    else if (width <= 1366) return 190;   // NEW: Specific for 1366x768 resolution
    else if (width <= 1396) return 210;   // Reduced from 250 to 210
    else if (width <= 1440) return 220;   // Reduced from 260 to 220
    else if (width <= 1536) return 200;   // Reduced from 240 to 200
    else if (width <= 1707) return 280;   // Reduced from 310 to 280
    else if (width <= 1920) return 300;   // Reduced from 320 to 300
    else return 350;                      // Keep large for ultra-wide screens
  };

  const spacing = getSpacingForWidth(windowWidth);
  const height = getHeightForWidth(windowWidth);

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
      height: height, // Responsive height based on screen width
      spacing: spacing
    },
    title: { text: null },
    xAxis: {
      categories: data.map(item => item.TIME),
      title: { text: "Time" },
      labels: { skew3d: true }
    },
    yAxis: {
      title: {
        text: "Energy Generated (MWh)",
        margin: 20,
      },
      labels: { skew3d: true }
    },
    tooltip: {
      headerFormat: "<b>{point.key}</b><br>",
      pointFormat: "Energy: <b>{point.y}</b> MWh"
    },
    plotOptions: {
      series: {
        depth: 25,
        colorByPoint: false
      }
    },
    series: [
      {
        name: "Energy Generated",
        data: data.map(item => parseFloat(item["Energy Generated"]) || 0),
        showInLegend: false,
        color: 'red'
      }
    ],
    credits: { enabled: false }
  };

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

export default CylinderChart;
