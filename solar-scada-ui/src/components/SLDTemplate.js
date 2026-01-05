import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import sldImage from '../assets/Plant_SLD_21MWp.png';
import axios from 'axios';
import './SLDTemplate.css';
import { API_ENDPOINTS } from '../apiConfig';
import Assessment from '@mui/icons-material/Assessment';
import Bolt from '@mui/icons-material/Bolt';

const SLDScreen = () => {
  const [inverterStatus, setInverterStatus] = useState({});
  const [mfmStatus, setMFMStatus] = useState({});
  const [popupData, setPopupData] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    inverters: { 1: true, 2: true, 3: true, 4: true },
    mfm: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true }
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatuses = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }
      
      const inverterIds = [1, 2, 3, 4];
      const mfmIds = [1, 2, 3, 4, 5, 6, 7, 8];

      console.time('SLD API Fetch');
      
      const API_TIMEOUT = 10000;
      const axiosConfig = { timeout: API_TIMEOUT };

      // Fetch inverter data individually and update states as they come
      inverterIds.forEach(async (id) => {
        try {
          const response = await axios.get(API_ENDPOINTS.inverter.getAll, { 
            params: { id }, 
            ...axiosConfig 
          });
          
          if (response.data) {
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            setInverterStatus(prev => ({ ...prev, [id]: data }));
            setLoadingStates(prev => ({
              ...prev,
              inverters: { ...prev.inverters, [id]: false }
            }));
          }
        } catch (error) {
          console.warn(`Inverter ${id} API failed:`, error.message);
          setLoadingStates(prev => ({
            ...prev,
            inverters: { ...prev.inverters, [id]: false }
          }));
        }
      });

      // Fetch MFM data
      try {
        const mfmResponse = await axios.get(API_ENDPOINTS.mfm.getAll, axiosConfig);
        
        if (mfmResponse.data) {
          const mfmStatusObj = {};
          mfmIds.forEach(id => {
            const matched = mfmResponse.data.find(item => item.ID === id);
            if (matched) mfmStatusObj[id] = matched;
          });
          
          setMFMStatus(prev => ({ ...prev, ...mfmStatusObj }));
          
          // Update loading states for all MFM devices
          const newMfmLoadingStates = {};
          mfmIds.forEach(id => {
            newMfmLoadingStates[id] = false;
          });
          
          setLoadingStates(prev => ({
            ...prev,
            mfm: newMfmLoadingStates
          }));
        }
      } catch (error) {
        console.warn('MFM API failed:', error.message);
        // Set all MFM loading states to false
        const newMfmLoadingStates = {};
        mfmIds.forEach(id => {
          newMfmLoadingStates[id] = false;
        });
        
        setLoadingStates(prev => ({
          ...prev,
          mfm: newMfmLoadingStates
        }));
      }

      console.timeEnd('SLD API Fetch');
      console.log('✅ SLD data fetch initiated');

    } catch (err) {
      console.error('❌ Error fetching SLD statuses:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatuses(false);
    
    // Set up interval for refresh
    const interval = setInterval(() => {
      fetchStatuses(true);
    }, 30000);
    
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

  // Individual Skeleton Button Component
  const SkeletonButton = ({ type, id }) => (
    <div className="skeleton-device-btn">
      <div className="skeleton-btn-content">
        <div className="skeleton-btn-icon"></div>
        <div className="skeleton-btn-text"></div>
        <div className="skeleton-btn-dot"></div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="sld-container">
        {/* Formula Screen Style Header */}
        <div className="sld-header">
          <h2 className="sld-title">Single Line Diagram</h2>
          {refreshing && (
            <div className="refresh-indicator">
              <div className="refresh-spinner"></div>
              <span>Refreshing...</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="sld-content">
          <div className="sld-main-area">
            {/* Device Control Panel */}
            <div className="device-control-panel">
              <div className="control-section">
                <h4 className="control-title"><Assessment /> Meters</h4>
                <div className="device-buttons">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(id => {
                    const isLoading = loadingStates.mfm[id];
                    const status = mfmStatus[id];
                    const isOnline = status && status.CUM_STS > 0;
                    const hasData = !!status;
                    
                    if (isLoading) {
                      return <SkeletonButton key={`mfm-skeleton-${id}`} type="mfm" id={id} />;
                    }
                    
                    return (
                      <button
                        key={`mfm-${id}`}
                        className={`device-btn mfm-btn ${isOnline ? 'online' : 'offline'} ${!hasData ? 'no-data' : ''}`}
                        onClick={() => hasData && handleClick('mfm', id)}
                        disabled={!hasData}
                        title={status?.ICR || `MFM ${id}${!hasData ? ' (No Data)' : ''}`}
                      >
                        <Assessment className="btn-icon" />
                        <span className="btn-text">MFM {id}</span>
                        <div className={`btn-status-dot ${hasData ? (isOnline ? 'online' : 'offline') : 'no-data'}`}></div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="control-section">
                <h4 className="control-title"><Bolt /> Inverters</h4>
                <div className="device-buttons">
                  {[1, 2, 3, 4].map(id => {
                    const isLoading = loadingStates.inverters[id];
                    const status = inverterStatus[id];
                    const isOnline = status && status.CUM_STS > 0;
                    const hasData = !!status;
                    
                    if (isLoading) {
                      return <SkeletonButton key={`inverter-skeleton-${id}`} type="inverter" id={id} />;
                    }
                    
                    return (
                      <button
                        key={`inverter-${id}`}
                        className={`device-btn inverter-btn ${isOnline ? 'online' : 'offline'} ${!hasData ? 'no-data' : ''}`}
                        onClick={() => hasData && handleClick('inverter', id)}
                        disabled={!hasData}
                        title={status?.Name || `Inverter ${id}${!hasData ? ' (No Data)' : ''}`}
                      >
                        <Bolt className="btn-icon" />
                        <span className="btn-text">INV {id}</span>
                        <div className={`btn-status-dot ${hasData ? (isOnline ? 'online' : 'offline') : 'no-data'}`}></div>
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

        {/* Compact Popup */}
        {popupData && (
          <div className="popup-overlay" onClick={handleOverlayClick}>
            <div className={`compact-popup ${popupData.status}`}>
              <div className="compact-popup-header">
                <div className="popup-title-section">
                  <div className={`device-badge ${popupData.type}`}>
                    {popupData.type === 'inverter' ? <Bolt /> : <Assessment />} {popupData.title}
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
