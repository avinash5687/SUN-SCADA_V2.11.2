import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import sldImage from '../assets/Plant_SLD_21MWp.png';
import axios from 'axios';
import './sldScreen.css';
import { API_ENDPOINTS } from '../apiConfig';

const SLDScreen = () => {
  const [inverterStatus, setInverterStatus] = useState({});
  const [mfmStatus, setMFMStatus] = useState({});
  const [popupData, setPopupData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatuses = async () => {
    try {
      if (Object.keys(inverterStatus).length === 0) setLoading(true);
      
      const inverterIds = [1, 2, 3, 4];
      const mfmIds = [1, 2, 3, 4, 5, 6, 7, 8];

      const inverterStatusPromises = inverterIds.map(id =>
        axios.get(API_ENDPOINTS.inverter.getAll, { params: { id } })
      );
      const mfmStatusAll = await axios.get(API_ENDPOINTS.mfm.getAll);

      const inverterResponses = await Promise.all(inverterStatusPromises);
      const inverterStatusObj = {};
      inverterResponses.forEach((res, i) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        inverterStatusObj[inverterIds[i]] = data;
      });

      const mfmStatusObj = {};
      mfmIds.forEach(id => {
        const matched = mfmStatusAll.data.find(item => item.ID === id);
        if (matched) mfmStatusObj[id] = matched;
      });

      setInverterStatus(inverterStatusObj);
      setMFMStatus(mfmStatusObj);
    } catch (err) {
      console.error('Error fetching statuses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDataForPopup = (rawData, type) => {
    let paramMap = {};

    if (type === 'inverter') {
      paramMap = {
        Active_Power: { parameter: 'Active Power', unit: 'kW' },
        DC_Power: { parameter: 'DC Power', unit: 'kW' },
        DC_Capacity: { parameter: 'DC Capacity', unit: 'kWp' },
        React_Power: { parameter: 'Reactive Power', unit: 'kVAr' },
        PF: { parameter: 'Power Factor', unit: '' },
        Frequency: { parameter: 'Frequency', unit: 'Hz' },
        Efficiancy: { parameter: 'Efficiency', unit: '%' },
        Voltage_RY: { parameter: 'RY Voltage', unit: 'V' },
        Voltage_YB: { parameter: 'YB Voltage', unit: 'V' },
        Voltage_BR: { parameter: 'BR Voltage', unit: 'V' },
        Current_R: { parameter: 'R Current', unit: 'A' },
        Current_Y: { parameter: 'Y Current', unit: 'A' },
        Current_B: { parameter: 'B Current', unit: 'A' },
        E_Today: { parameter: 'Energy Today', unit: 'kWh' },
        E_Total: { parameter: 'Energy Total', unit: 'MWh' },
      };
    } else if (type === 'mfm') {
      paramMap = {
        AC_PWR: { parameter: 'Active Power', unit: 'kW' },
        APP_PWR: { parameter: 'Apparent Power', unit: 'kVA' },
        RCT_PWR: { parameter: 'Reactive Power', unit: 'kVAr' },
        PF: { parameter: 'Power Factor', unit: '' },
        FRQ: { parameter: 'Frequency', unit: 'Hz' },
        RY_VLT: { parameter: 'RY Voltage', unit: 'V' },
        YB_VLT: { parameter: 'YB Voltage', unit: 'V' },
        BR_VLT: { parameter: 'BR Voltage', unit: 'V' },
        R_L_CRNT: { parameter: 'R Line Current', unit: 'A' },
        Y_L_CRNT: { parameter: 'Y Line Current', unit: 'A' },
        B_L_CRNT: { parameter: 'B Line Current', unit: 'A' },
        TOT_IMP_KWh: { parameter: 'Total Export Energy', unit: 'kWh' },
        TOT_EXP_KWh: { parameter: 'Total Import Energy', unit: 'kWh' },
        TOT_EXP_KVArh: { parameter: 'Total Export Reactive Energy', unit: 'kVArh' },
        TOT_IMP_KVArh: { parameter: 'Total Import Reactive Energy', unit: 'kVArh' },
        TODAY_IMPORT_ENERGY: { parameter: 'Daily Export Energy', unit: 'kWh' },
        TODAY_EXPORT_ENERGY: { parameter: 'Daily Import Energy', unit: 'kWh' },
      };
    }

    const dataEntries = Object.entries(rawData).map(([key, value]) => {
      const map = paramMap[key];
      return map
        ? {
            parameter: map.parameter,
            value: value,
            unit: map.unit,
          }
        : null;
    }).filter(Boolean);

    // Add PR to inverter popup
    if (type === 'inverter') {
      const energy = parseFloat(rawData.E_Today || 0);
      const dcCapacity = parseFloat(rawData.DC_Capacity || 0);
      const poa = parseFloat(rawData.POA || 0);
      if (dcCapacity > 0 && poa > 0) {
        const pr = (energy / (dcCapacity * poa)) * 100;
        dataEntries.push({
          parameter: 'Performance Ratio',
          value: pr.toFixed(2),
          unit: '%',
        });
      }
    }

    return dataEntries;
  };

  const handleClick = (type, id) => {
    const raw = type === 'inverter' ? inverterStatus[id] : mfmStatus[id];
    if (!raw) return;
    
    const formatted = formatDataForPopup(raw, type);
    const title = raw?.Name || raw?.ICR || (type.toUpperCase() + ' ' + id);
    const status = raw?.CUM_STS > 0 ? 'online' : 'offline';
    
    setPopupData({ 
      data: formatted, 
      title, 
      type, 
      status,
      deviceId: id 
    });
  };

  const closePopup = () => setPopupData(null);

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('popup-overlay')) {
      closePopup();
    }
  };

  return (
    <Layout>
      <div className="sld-container">
        {/* Formula Screen Style Header */}
        <div className="sld-header">
          <h2 className="sld-title">Single Line Diagram</h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="sld-loading">
            <div className="loading-spinner"></div>
            <span>Loading SLD data...</span>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <div className="sld-content">
            <div className="sld-main-area">
              {/* Device Control Panel */}
              <div className="device-control-panel">
                <div className="control-section">
                  <h4 className="control-title">📊 Meters</h4>
                  <div className="device-buttons">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(id => {
                      const status = mfmStatus[id];
                      const isOnline = status && status.CUM_STS > 0;
                      return (
                        <button
                          key={`mfm-${id}`}
                          className={`device-btn mfm-btn ${isOnline ? 'online' : 'offline'}`}
                          onClick={() => handleClick('mfm', id)}
                          title={status?.ICR || `MFM ${id}`}
                        >
                          <span className="btn-icon">📊</span>
                          <span className="btn-text">MFM {id}</span>
                          <div className={`btn-status-dot ${isOnline ? 'online' : 'offline'}`}></div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="control-section">
                  <h4 className="control-title">⚡ Inverters</h4>
                  <div className="device-buttons">
                    {[1, 2, 3, 4].map(id => {
                      const status = inverterStatus[id];
                      const isOnline = status && status.CUM_STS > 0;
                      return (
                        <button
                          key={`inverter-${id}`}
                          className={`device-btn inverter-btn ${isOnline ? 'online' : 'offline'}`}
                          onClick={() => handleClick('inverter', id)}
                          title={status?.Name || `Inverter ${id}`}
                        >
                          <span className="btn-icon">⚡</span>
                          <span className="btn-text">INV {id}</span>
                          <div className={`btn-status-dot ${isOnline ? 'online' : 'offline'}`}></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SLD Image */}
              <div className="sld-image-container">
                <img src={sldImage} alt="Single Line Diagram" className="sld-image" />
              </div>
            </div>
          </div>
        )}

        {/* Compact Popup with Reduced Width */}
        {popupData && (
          <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className={`compact-popup ${popupData.status}`}>
              <div className="compact-popup-header">
                <div className="popup-title-section">
                  <div className={`device-badge ${popupData.type}`}>
                    {popupData.type === 'inverter' ? '⚡' : '📊'} {popupData.title}
                  </div>
                  <div className={`status-indicator ${popupData.status}`}>
                    <span className="status-dot"></span>
                    {popupData.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                  </div>
                </div>
                <button className="compact-close-btn" onClick={closePopup}>✕</button>
              </div>
              
              <div className="compact-popup-content">
                <div className="data-grid">
                  {popupData.data.map((item, index) => (
                    <div key={index} className="data-item">
                      <div className="param-name">{item.parameter}</div>
                      <div className="param-value">
                        <span className="value">{item.value}</span>
                        <span className="unit">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SLDScreen;
