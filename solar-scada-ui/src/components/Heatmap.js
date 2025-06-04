import React, { useRef, useState } from "react";
import "./Heatmap.css";

const heatmapCategories = [
  { key: "TotalEnergy", deviationKey: "DeviationPercentage", label: "Daily Energy" },
  { key: "AC_PWR", deviationKey: "Dev_PerAC", label: "Active Power" },
  { key: "SPC_YLD", deviationKey: "Dev_Per_SPC_YLD", label: "Specific Yield" },
  { key: "PR", deviationKey: "Dev_Per_PR", label: "PR" },
];

const Heatmap = ({ data }) => {
const tooltipRef = useRef(null);
const [tooltipVisible, setTooltipVisible] = useState(false);
const [tooltipContent, setTooltipContent] = useState("");

const getStatus = (deviation) => {
  if (deviation < 25) return "Good";
  if (deviation < 50) return "Average";
  if (deviation < 75) return "Poor";
  return "Critical";
};

const handleMouseOver = (event, item, category) => {
  const tooltip = tooltipRef.current;
  if (tooltip) {
    const deviation = item[category.deviationKey];
    const status = getStatus(deviation);

    // Calculate the maximum value in the data for the current category
    const maxValue = Math.max(...data.map(d => d[category.key]));

    setTooltipVisible(true);
    setTooltipContent(`
      Device: ${item.Inverter_Name} <br>
      ${category.label}: ${item[category.key]} <br>
      Max Value: ${maxValue} <br>
      Deviation: ${deviation}% <br>
      Status: ${status}
    `);

    const cell = event.currentTarget;
    const cellRect = cell.getBoundingClientRect();
    const containerRect = cell.closest('.heatmap-container').getBoundingClientRect();

    const x = cellRect.left - containerRect.left;
    const y = cellRect.top - containerRect.top - tooltip.offsetHeight - 5;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.visibility = "visible";
    tooltip.style.display = "block";
  }
};

const handleMouseMove = (event) => {
  const tooltip = tooltipRef.current;
  const cell = event.currentTarget; // The cell that triggered the event

  if (tooltip && tooltipVisible) {
    // Get the dimensions and position of the cell
    const cellRect = cell.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    // Calculate tooltip position to be centered on top of the cell
    const x = cellRect.left + (cellRect.width / 2) - (tooltipWidth / 2);
    const y = cellRect.top - tooltipHeight - 5; // A little gap above the cell

    // Update tooltip position
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.visibility = "visible";
    tooltip.style.display = "block";
  }
};

    
const handleMouseOut = () => {
  setTooltipVisible(false);
  const tooltip = tooltipRef.current;
  if (tooltip) {
    tooltip.style.visibility = "hidden";
    tooltip.style.display = "none";
  }
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
      <div className="legend">
        <h4>Legend:</h4>
        {legendData.map((item, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: item.color }}
            ></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="heatmap-wrapper">
      {heatmapCategories.map((category) => (
        <div key={category.key} className="heatmap-section">
          <h3>{category.label}</h3>
          <div className="heatmap-container" id={category.key}>
            {data.map((item) => (
              <div
                key={`${item.ID}-${category.key}`}
                className="heatmap-cell"
                style={{ backgroundColor: getColor(item[category.deviationKey]) }}
                onMouseOver={(e) => handleMouseOver(e, item, category, e.currentTarget.parentElement)}
                onMouseMove={handleMouseMove}
                onMouseOut={handleMouseOut}
              ></div>
            ))}
          </div>
        </div>
      ))}
      <div
        id="tooltip"
        ref={tooltipRef}
        className={`tooltip ${tooltipVisible ? "visible" : ""}`}
        dangerouslySetInnerHTML={{ __html: tooltipContent }}
      ></div>
      <Legend />
    </div>
  );
};

export default Heatmap;
