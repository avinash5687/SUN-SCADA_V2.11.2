import React from "react";
import "./DeviceStatusPopup.css";

const DeviceStatusPopup = ({ data, onClose }) => {
  if (!data) return null; // Prevent errors if data is undefined

  return (
    <div className="popup-overlay" onClick={onClose}> {/* Close on background click */}
      <div className="popup-content" onClick={(e) => e.stopPropagation()}> 
        <h2>Device Communication Status</h2>
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
                  <td>{device.Date_Time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
        <button className="close-popup-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default DeviceStatusPopup;
