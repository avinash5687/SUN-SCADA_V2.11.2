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


const DeviceStatusPopup = ({ data, onClose }) => {
  const [sortField, setSortField] = useState('NAME');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterType, setFilterType] = useState('All');

  if (!data) return null;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Enhanced device type detection - SMB gets priority
  const getDeviceType = (deviceName) => {
    const name = (deviceName || '').toLowerCase();
    
    // Check SMB FIRST before inverter
    if (name.includes('smb')) return 'SMB';
    if (name.includes('inverter') || name.includes('inv')) return 'INV';
    if (name.includes('mfm') || name.includes('meter')) return 'MFM';
    if (name.includes('wms') || name.includes('weather')) return 'WMS';
    if (name.includes('trafo') || name.includes('transformer')) return 'TRF';
    
    return 'DEV';
  };

  // Filter data by type
  const filteredData = data.filter(device => {
    if (filterType === 'All') return true;
    return getDeviceType(device.NAME) === filterType;
  });

  const sortedData = [...filteredData].sort((a, b) => {
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

  // Count devices by type
  const typeCounts = {
    INV: data.filter(d => getDeviceType(d.NAME) === 'INV').length,
    MFM: data.filter(d => getDeviceType(d.NAME) === 'MFM').length,
    SMB: data.filter(d => getDeviceType(d.NAME) === 'SMB').length,
    WMS: data.filter(d => getDeviceType(d.NAME) === 'WMS').length,
    TRF: data.filter(d => getDeviceType(d.NAME) === 'TRF').length,
    DEV: data.filter(d => getDeviceType(d.NAME) === 'DEV').length,
  };

  return (
    <div className="device-overlay" onClick={(e) => e.target.classList.contains('device-overlay') && onClose()}>
      <div className="device-popup">
        
        {/* Compact Header */}
        <div className="device-header">
          <div className="header-info">
            <h3>Device Status</h3>
            <div className="quick-stats">
              <span className="stat-badge">Total: {data.length}</span>
              <span className="stat-badge online">Online: {onlineCount}</span>
              <span className="stat-badge offline">Offline: {offlineCount}</span>
            </div>
          </div>
          <button className="close-x" onClick={onClose}>×</button>
        </div>

        {/* Compact Filter Chips */}
        <div className="filter-chips">
          <button 
            className={`chip ${filterType === 'All' ? 'active' : ''}`}
            onClick={() => setFilterType('All')}
          >
            All ({data.length})
          </button>
          {typeCounts.INV > 0 && (
            <button 
              className={`chip chip-inv ${filterType === 'INV' ? 'active' : ''}`}
              onClick={() => setFilterType('INV')}
            >
              INV ({typeCounts.INV})
            </button>
          )}
          {typeCounts.MFM > 0 && (
            <button 
              className={`chip chip-mfm ${filterType === 'MFM' ? 'active' : ''}`}
              onClick={() => setFilterType('MFM')}
            >
              MFM ({typeCounts.MFM})
            </button>
          )}
          {typeCounts.SMB > 0 && (
            <button 
              className={`chip chip-smb ${filterType === 'SMB' ? 'active' : ''}`}
              onClick={() => setFilterType('SMB')}
            >
              SMB ({typeCounts.SMB})
            </button>
          )}
          {typeCounts.WMS > 0 && (
            <button 
              className={`chip chip-wms ${filterType === 'WMS' ? 'active' : ''}`}
              onClick={() => setFilterType('WMS')}
            >
              WMS ({typeCounts.WMS})
            </button>
          )}
          {typeCounts.TRF > 0 && (
            <button 
              className={`chip chip-trf ${filterType === 'TRF' ? 'active' : ''}`}
              onClick={() => setFilterType('TRF')}
            >
              TRF ({typeCounts.TRF})
            </button>
          )}
        </div>

        {/* Compact Data Table */}
        <div className="table-wrap">
          <table className="device-grid">
            <thead>
              <tr>
                <th className="col-name" onClick={() => handleSort('NAME')}>
                  Device Name <span className="sort">↕</span>
                </th>
                <th className="col-type">Type</th>
                <th className="col-status" onClick={() => handleSort('CUM_STS')}>
                  Status <span className="sort">↕</span>
                </th>
                <th className="col-time" onClick={() => handleSort('Date_Time')}>
                  Last Comm <span className="sort">↕</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((device, index) => {
                  const isOnline = device.CUM_STS?.toLowerCase() === "online";
                  const deviceType = getDeviceType(device.NAME);

                  return (
                    <tr key={index} className={!isOnline ? 'offline-row' : ''}>
                      <td className="device-name">{device.NAME || 'Unknown'}</td>
                      <td className="device-type">
                        <span className={`type-tag ${deviceType.toLowerCase()}`}>
                          {deviceType}
                        </span>
                      </td>
                      <td className="device-status">
                        <div className={`status ${isOnline ? 'online' : 'offline'}`}>
                          <span className="dot"></span>
                          {isOnline ? 'ON' : 'OFF'}
                        </div>
                      </td>
                      <td className="timestamp">{formatDateTime(device.Date_Time)}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">No devices found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


export default DeviceStatusPopup;
