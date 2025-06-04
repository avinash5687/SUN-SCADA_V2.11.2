import React from "react";
import "./FormulaBlock.css"; // for styling (optional)

const FormulaBlock = ({ label, value, unit, color }) => {
  return (
    <div className="formula-block" style={{ border: `2px solid ${color}` }}>
      <div className="label">{label}</div>
      <div className="value">
        {value} <span className="unit">{unit}</span>
      </div>
    </div>
  );
};

export default FormulaBlock;
