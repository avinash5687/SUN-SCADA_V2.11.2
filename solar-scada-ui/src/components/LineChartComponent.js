import React, { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const HighchartsLineComponent = ({ data, onZoomChange }) => {
  const chartRef = useRef(null);
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
      else if (width <= 1536) return 170;
      else if (width <= 1707) return 220
      else if (width <= 1920) return 220;
      else return 300;
    };
  
    const spacing = getSpacingForWidth(windowWidth);
    const height = getHeightForWidth(windowWidth);

  // Normalize your data for Highcharts
  const poaSeries = data.map(d => [new Date(d.Date_Time).getTime(), d.POA]);
  const activePowerSeries = data.map(d => [new Date(d.Date_Time).getTime(), d.ACTIVE_POWER]);
  

  const options = {
    chart: {
      type: 'line',
      zoomType: 'x',
      height: '60vh',
      animation: {
        duration: 1200
      },
      events: {
        selection: function(event) {
          onZoomChange?.(!!event.xAxis);
        }
      },
      height: height,
      spacing: spacing
    },
    title: {
      text: 'POA vs ACTIVE_POWER'
    },
    xAxis: {
      type: 'datetime'
    },
    yAxis: [
      {
        title: {
          text: 'POA'
        },
        opposite: false,
        lineColor: '#ff7300',
        lineWidth: 2,
        labels: {
          style: {
            color: '#ff7300'
          }
        },
        min: 0,
        max: 1200
      },
      {
        title: {
          text: 'ACTIVE_POWER'
        },
        opposite: true,
        lineColor: '#387908',
        lineWidth: 2,
        labels: {
          style: {
            color: '#387908'
          }
        },
        min: 0,
        max: 14000
      }
    ],
    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      y: 20
    },
    tooltip: {
      shared: true,
      crosshairs: true
    },
    series: [
      {
        name: 'POA',
        data: poaSeries,
        yAxis: 0,
        color: '#ff7300',
        marker: {
          enabled: false
        }
      },
      {
        name: 'ACTIVE_POWER',
        data: activePowerSeries,
        yAxis: 1,
        color: '#387908',
        marker: {
          enabled: false
        }
      }
    ]
  };

  return (
    <div className="line-chart-wrapper">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        ref={chartRef}
      />
    </div>
  );
};

export default HighchartsLineComponent;
