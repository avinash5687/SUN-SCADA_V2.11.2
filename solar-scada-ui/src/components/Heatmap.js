import React, { useRef, useState } from "react";
import "./Heatmap.css";

const heatmapCategories = [
  { key: "TotalEnergy", deviationKey: "DeviationPercentage", label: "Daily Energy" },
  { key: "AC_PWR", deviationKey: "Dev_PerAC", label: "Active Power" },
  { key: "SPC_YLD", deviationKey: "Dev_Per_SPC_YLD", label: "Specific Yield" },
  { key: "PR", deviationKey: "Dev_Per_PR", label: "PR" },
];

const kpiMap = [
  { key: "P_EXP", label: "Export", unit: "kWh" },
  { key: "P_IMP", label: "Import", unit: "kWh" },
  { key: "PR", label: "PR", unit: "%" },
  { key: "POA", label: "POA", unit: "W/m²" },
  { key: "CUF", label: "CUF", unit: "%" },
  { key: "PA", label: "PA", unit: "%" },
  { key: "GA", label: "GA", unit: "%" },
];

const Heatmap = ({ data, plantKPI }) => {
  const tooltipRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipStyle, setTooltipStyle] = useState({ left: 0, top: 0 });

  const getStatus = (deviation) => {
    if (deviation < 25) return "Good";
    if (deviation < 50) return "Average";
    if (deviation < 75) return "Poor";
    return "Critical";
  };

  const handleMouseOver = (event, item, category) => {
    const deviation = item[category.deviationKey];
    const status = getStatus(deviation);
    const maxValue = Math.max(...data.map(d => d[category.key]));

    setTooltipVisible(true);
    setTooltipContent(`
      <strong>Device:</strong> ${item.Inverter_Name} <br>
      <strong>${category.label}:</strong> ${item[category.key]} <br>
      <strong>Max Value:</strong> ${maxValue} <br>
      <strong>Deviation:</strong> ${deviation}% <br>
      <strong>Status:</strong> ${status}
    `);

    const cellRect = event.currentTarget.getBoundingClientRect();
    const tooltip = tooltipRef.current;

    setTimeout(() => {
      if (tooltip) {
        const tooltipRect = tooltip.getBoundingClientRect();
        let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
        let top = cellRect.top - tooltipRect.height - 8;
        if (top < 0) top = cellRect.bottom + 8;
        if (left + tooltipRect.width > window.innerWidth) {
          left = window.innerWidth - tooltipRect.width - 8;
        }
        if (left < 0) left = 8;
        setTooltipStyle({ left, top });
      }
    }, 0);
  };

  const handleMouseOut = () => {
    setTooltipVisible(false);
  };

  const getColor = (deviation) => {
    if (deviation >= 0 && deviation < 25) return "rgba(0, 128, 0, 0.8)";
    if (deviation >= 25 && deviation < 50) return "rgba(255, 255, 0, 0.8)";
    if (deviation >= 50 && deviation < 75) return "rgba(255, 165, 0, 0.8)";
    if (deviation >= 75) return "rgba(255, 0, 0, 0.8)";
    return "rgba(255, 255, 255, 0.8)";
  };

  const Legend = () => {
    const legendData = [
      { color: "rgba(0, 128, 0, 0.8)", label: "0% ≤ Deviation < 25%" },
      { color: "rgba(255, 255, 0, 0.8)", label: "25% ≤ Deviation < 50%" },
      { color: "rgba(255, 165, 0, 0.8)", label: "50% ≤ Deviation < 75%" },
      { color: "rgba(255, 0, 0, 0.8)", label: "Deviation ≥ 75%" },
    ];

    return (
      <div className="legend legend-horizontal">
        <h4>Legend:</h4>
        {legendData.map((item, index) => (
          <div key={index} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="heatmap-root">
      <div className="plant-kpi-bar1">
        {kpiMap.map(({ key, label, unit }) => (
          <div className="kpi-box1" key={key}>
            <span className="kpi-label1">{label}</span>
            <span className="kpi-value1">
              {plantKPI[key] !== undefined ? parseFloat(plantKPI[key]).toFixed(2) : '--'} {unit}
            </span>
          </div>
        ))}
      </div>
      <div className="heatmap-legend-row">
        <Legend />
      </div>

      <div className="heatmap-main-grid heatmap-main-grid-rowwise">
        {heatmapCategories.map((category) => (
          <div key={category.key} className="heatmap-grid-row">
            <div className="heatmap-row-title">{category.label}</div>
            <div className="heatmap-row-cells">
              {data.map((item) => (
                <div
                  key={`${item.ID}-${category.key}`}
                  className="heatmap-cell"
                  style={{ backgroundColor: getColor(item[category.deviationKey]) }}
                  onMouseOver={(e) => handleMouseOver(e, item, category)}
                  onMouseOut={handleMouseOut}
                ></div>
              ))}
            </div>
          </div>
        ))}
        <div
          ref={tooltipRef}
          className={`tooltip ${tooltipVisible ? "visible" : ""}`}
          style={{
            left: tooltipStyle.left,
            top: tooltipStyle.top,
            position: "fixed",
            pointerEvents: "none",
            zIndex: 1000
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        ></div>
      </div>
    </div>
  );
};

export default Heatmap;
