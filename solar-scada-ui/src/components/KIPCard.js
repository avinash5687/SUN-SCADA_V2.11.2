import React from "react";
import "./KIPCard.css"; // Add styles for the cards

const KIPCard = ({ title, value, unit }) => {
  return (
    <div className="kip-card">
      <h3>{title}</h3>
      <p>{value} {unit}</p>
    </div>
  );
};

export default KIPCard;
