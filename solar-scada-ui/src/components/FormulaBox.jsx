// src/components/FormulaBox.jsx
import React from "react";

const FormulaBox = ({ title, text, formula }) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "15px",
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        backgroundColor: "#444",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "25px",
      }}
    >
      <h2 style={{ color: "#FFFFFF", fontWeight: "bold",}}>{title}</h2>

      {text && (
        <p
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: "10px",
          }}
        >
          {text}
        </p>
      )}

      <p
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          whiteSpace: "pre-line",
          color: "#FFFFFF",
        }}
      >
        {formula}
      </p>
    </div>
  );
};

export default FormulaBox;
