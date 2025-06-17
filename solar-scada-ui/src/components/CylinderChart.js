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
    if (width <= 1229) return [5, 0, 8, -25];
    else if (width <= 1240) return [6, 6, 9, -12];
    else if (width <= 1396) return [8, 8, 10, -20];
    else if (width <= 1440) return [10, 10, 12, -20];
    else if (width <= 1536) return [0, 10, 10, -22];
    else if (width <= 1707) return [14, 14, 16, -24];
    else if (width <= 1920) return [16, 16, 18, -26];
    else return [18, 18, 20, -28];
  };

  const getHeightForWidth = (width) => {
    if (width <= 1229) return 150;
    else if (width <= 1240) return 160;
    else if (width <= 1396) return 160;
    else if (width <= 1440) return 170;
    else if (width <= 1536) return 150;
    else if (width <= 1707) return 220
    else if (width <= 1920) return 220;
    else return 250;
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
      height: height,
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
