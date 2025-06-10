import React from 'react';

const ProgressBarCell = ({ value, max, unit }) => {
  const numericValue = parseFloat(value) || 0;
  const numericMax = parseFloat(max) || 100;

  // Calculate percentage, ensuring it doesn't exceed 100%
  const percentage = Math.min((numericValue / numericMax) * 100, 100);

  // Determine the color of the bar based on the percentage
  let barColor = '#3498db'; // Default blue
  if (percentage > 85) {
    barColor = '#e74c3c'; // Red for high values
  } else if (percentage > 50) {
    barColor = '#f1c40f'; // Yellow for medium-high values
  }

  return (
    <div className="progress-bar-cell">
      <div
        className="progress-bar-fill"
        style={{ width: `${percentage}%`, backgroundColor: barColor }}
      ></div>
      <span className="progress-bar-text">
        {numericValue} {unit}
      </span>
    </div>
  );
};

export default ProgressBarCell;
