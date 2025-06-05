import React from "react";
import "./DeviceStatusPopup.css";
import closeIcon from "../assets/close-icon.png"; // <- Use your uploaded red cross image

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}`;
};

const DeviceStatusPopup = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Device Communication Status</h2>
          <img
            src={closeIcon}
            alt="Close"
            className="popup-close-icon"
            onClick={onClose}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Device</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((device, index) => (
                <tr key={index}>
                  <td>{device.NAME}</td>
                  <td className={device.CUM_STS.toLowerCase() === "online" ? "status-online" : "status-offline"}>
                    {device.CUM_STS}
                  </td>
                  <td>{formatDateTime(device.Date_Time)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceStatusPopup;
