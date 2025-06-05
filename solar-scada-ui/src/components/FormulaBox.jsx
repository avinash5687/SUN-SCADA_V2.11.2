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
      }}
    >
      <h3 style={{ color: "#FFFFFF", marginBottom: "10px" }}>{title}</h3>

      {text && (
        <p
          style={{
            fontSize: "22px",
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
          fontSize: "24px",
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
