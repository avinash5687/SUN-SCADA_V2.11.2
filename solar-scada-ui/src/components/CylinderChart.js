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

  // Process data based on trend type
  const processChartData = () => {
    if (trendType === "day") {
      // For daily view, use the HourBlock to create 0-23 hour structure
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        // Find matching data for this hour
        const hourData = data.find(item => item.HourBlock === hour);
        return {
          hour,
          energy: hourData ? parseFloat(hourData["Energy Generated"] || 0) : 0,
          period: `${hour.toString().padStart(2, '0')}:00`
        };
      });

      return {
        categories: hourlyData.map(d => d.period),
        seriesData: hourlyData.map(d => d.energy),
        xAxisTitle: "Hour of Day"
      };
    } else {
      // For other trend types (week, month, year)
      return {
        categories: data.map(item => item.Time || item.TIME || item.period || item.name),
        seriesData: data.map(item => parseFloat(item["Energy Generated"] || 0)),
        xAxisTitle: "Time Period"
      };
    }
  };

  const chartData = processChartData();

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
      categories: chartData.categories,
      title: { text: chartData.xAxisTitle },
      labels: { 
        skew3d: true,
        rotation: trendType === "day" ? 0 : -45,
        step: trendType === "day" ? 2 : 1, // Show every 2nd hour for daily view
        style: { fontSize: '10px' }
      },
      tickInterval: trendType === "day" ? 1 : undefined,
      min: 0,
      max: trendType === "day" ? 23 : undefined
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
        data: chartData.seriesData,
        showInLegend: false,
        color: 'red'
      }
    ],
    credits: { enabled: false }
  };

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

export default CylinderChart;
