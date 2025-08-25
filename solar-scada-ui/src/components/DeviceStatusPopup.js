import React, { useState } from "react";
import "./DeviceStatusPopup.css";

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${MM}-${dd} ${HH}:${mm}`;
};

const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return '0m';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
};

const DeviceStatusPopup = ({ data, onClose }) => {
  const [sortField, setSortField] = useState('NAME');
  const [sortDirection, setSortDirection] = useState('asc');

  if (!data) return null;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'Date_Time') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const onlineCount = data.filter(d => d.CUM_STS?.toLowerCase() === "online").length;
  const offlineCount = data.length - onlineCount;

  return (
    <div className="device-overlay" onClick={(e) => e.target.classList.contains('device-overlay') && onClose()}>
      <div className="device-popup">
        
        {/* Compact Header */}
        <div className="device-header">
          <div className="header-info">
            <h3>Device Communication Status</h3>
            <div className="quick-stats">
              <span>Total: {data.length}</span>
              <span>Online: {onlineCount}</span>
              <span>Offline: {offlineCount}</span>
            </div>
          </div>
          <button className="close-x" onClick={onClose}>×</button>
        </div>

        {/* Data Table - Removed duplicate status cards */}
        <div className="table-wrap">
          <table className="device-grid">
            <thead>
              <tr>
                <th onClick={() => handleSort('NAME')}>
                  Device Name <span className="sort">↕</span>
                </th>
                <th>Type</th>
                <th onClick={() => handleSort('CUM_STS')}>
                  Status <span className="sort">↕</span>
                </th>
                <th onClick={() => handleSort('Date_Time')}>
                  Last Comm <span className="sort">↕</span>
                </th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((device, index) => {
                const isOnline = device.CUM_STS?.toLowerCase() === "online";
                const deviceType = device.NAME?.toLowerCase().includes('inverter') ? 'INV' :
                                  device.NAME?.toLowerCase().includes('mfm') ? 'MFM' :
                                  device.NAME?.toLowerCase().includes('meter') ? 'MFM' : // Changed MTR to MFM
                                  device.NAME?.toLowerCase().includes('wms') ? 'WMS' : 'DEV';

                return (
                  <tr key={index}>
                    <td className="device-name">{device.NAME || 'Unknown'}</td>
                    <td>
                      <span className={`type-tag ${deviceType.toLowerCase()}`}>
                        {deviceType}
                      </span>
                    </td>
                    <td>
                      <div className={`status ${isOnline ? 'online' : 'offline'}`}>
                        <span className="dot"></span>
                        {isOnline ? 'ON' : 'OFF'}
                      </div>
                    </td>
                    <td className="timestamp">{formatDateTime(device.Date_Time)}</td>
                    <td className="age">{getTimeAgo(device.Date_Time)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Simple Footer
        <div className="device-footer">
          <span>Updated: {new Date().toLocaleTimeString()}</span>
          <button className="refresh-btn" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default DeviceStatusPopup;
