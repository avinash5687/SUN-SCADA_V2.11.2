// src/components/FormulaBox.jsx
import React from "react";

const FormulaBox = ({ title, text, formula}) => {
  return (
    <div style={{
      border: "1px solid #ccc",
      padding: "15px",
      margin: "10px",
      width: "480px",
      borderRadius: "8px",
      backgroundColor: "#444",
    }}>
      <h3 style={{ color: "#FFFFFF", marginBottom: "10px" }}>{title}</h3>

      {text && (
        <p style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: "#FFFFFF",
          marginBottom: "10px"
        }}>
          {text}
        </p>
      )}

      <p style={{ fontSize: "18px", fontWeight: "bold", whiteSpace: "pre-line", color: "#FFFFFF" }}>{formula}</p>
    </div>
  );
};

export default FormulaBox;
