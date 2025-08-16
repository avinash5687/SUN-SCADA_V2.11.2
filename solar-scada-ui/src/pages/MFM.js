import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MFM.css"; // All styles will come from this file
import mfmImage from '../assets/Meter.jpg'; // Make sure this path is correct
import { API_ENDPOINTS } from "../apiConfig";

const MFM = () => {
  const [mfmData, setMfmData] = useState([]);
  const [activeBlock, setActiveBlock] = useState('BLOCK1'); // Default to BLOCK 1
  const [loading, setLoading] = useState(false);

  const fetchMFMData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.mfm.getAll);
      setMfmData(response.data);
    } catch (error) {
      console.error("Error fetching MFM data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMFMData();
    const interval = setInterval(fetchMFMData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter data based on active block with specific meter names
  const getFilteredData = () => {
    if (!mfmData || mfmData.length === 0) return [];
    
    if (activeBlock === 'BLOCK1') {
      // Block 1 specific meters
      const block1Meters = [
        'BLOCK-1_HT-MFM',
        'BLOCK-1_AUX-MFM', 
        'BLOCK-1_MAIN-METER',
        'BLOCK-1_CHECK-METER'
      ];
      
      return mfmData.filter(meter => {
        const meterName = meter.ICR || '';
        return block1Meters.some(blockMeter => 
          meterName.includes(blockMeter) || meterName === blockMeter
        );
      });
    } else {
      // Block 2 - all remaining meters (not in Block 1 list)
      const block1Meters = [
        'BLOCK-1_HT-MFM',
        'BLOCK-1_AUX-MFM', 
        'BLOCK-1_MAIN-METER',
        'BLOCK-1_CHECK-METER'
      ];
      
      return mfmData.filter(meter => {
        const meterName = meter.ICR || '';
        return !block1Meters.some(blockMeter => 
          meterName.includes(blockMeter) || meterName === blockMeter
        );
      });
    }
  };

  const filteredData = getFilteredData();

  const handleBlockSwitch = (block) => {
    setActiveBlock(block);
  };

  const parameters = [
    { name: "Timestamp", key: "Date_Time", unit: "" },
    { name: "R Phase Voltage", key: "RY_VLT", unit: "V" },
    { name: "Y Phase Voltage", key: "YB_VLT", unit: "V" },
    { name: "B Phase Voltage", key: "BR_VLT", unit: "V" },
    { name: "R Phase Current", key: "R_L_CRNT", unit: "A" },
    { name: "Y Phase Current", key: "Y_L_CRNT", unit: "A" },
    { name: "B Phase Current", key: "B_L_CRNT", unit: "A" },
    { name: "Active Power", key: "AC_PWR", unit: "kW" },
    { name: "Reactive Power", key: "RCT_PWR", unit: "kVAr" },
    { name: "Apparent Power", key: "APP_PWR", unit: "kVA" },
    { name: "Frequency", key: "FRQ", unit: "Hz" },
    { name: "Power Factor", key: "PF", unit: "" },
    { name: "Total Active Export", key: "TOT_IMP_KWh", unit: "kWh" },
    { name: "Total Active Import", key: "TOT_EXP_KWh", unit: "kWh" },
    { name: "Total Reactive Export", key: "TOT_EXP_KVArh", unit: "kVArh" },
    { name: "Total Reactive Import", key: "TOT_IMP_KVArh", unit: "kVArh" },
    { name: "Today Active Export", key: "TODAY_IMP_KWh", unit: "kWh" },
    { name: "Today Active Import", key: "TODAY_EXP_KWh", unit: "kWh" },
  ];

  return (
    <div className="mfm-container">
      {/* Header with Title and Block Buttons */}
      <div className="mfm-header">
        <h2 className="mfm-title">MFM Data Overview</h2>
        
        <div className="block-controls">
          <div className="block-buttons">
            <button
              className={`block-btn ${activeBlock === 'BLOCK1' ? 'active' : ''}`}
              onClick={() => handleBlockSwitch('BLOCK1')}
              disabled={loading}
            >
              <span className="btn-icon">🏢</span>
              BLOCK 1
            </button>
            <button
              className={`block-btn ${activeBlock === 'BLOCK2' ? 'active' : ''}`}
              onClick={() => handleBlockSwitch('BLOCK2')}
              disabled={loading}
            >
              <span className="btn-icon">🏭</span>
              BLOCK 2
            </button>
          </div>
          
          {/* Data Info */}
          <div className="data-info">
            <div className="active-block-indicator">
              <span className={`block-status ${activeBlock.toLowerCase()}`}>
                {activeBlock === 'BLOCK1' ? '● BLOCK 1' : '● BLOCK 2'}
              </span>
              <span className="meter-count">
                {filteredData.length} Meter{filteredData.length !== 1 ? 's' : ''}
              </span>
            </div>
            {loading && (
              <div className="loading-indicator">
                <div className="loading-spinner"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      {filteredData.length === 0 && !loading ? (
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <h3>No Data Available</h3>
          <p>No MFM data found for {activeBlock}. Please check your connection or try refreshing.</p>
          <button className="retry-btn" onClick={fetchMFMData}>
            🔄 Retry
          </button>
        </div>
      ) : (
        <div className="mfm-table-wrapper">
          <table className="mfm-table">
            <thead>
              <tr>
                <th className="parameter-header">Parameters</th>
                {filteredData.map((meter, index) => (
                  <th key={index}>
                    <div className="mfm-header-content">
                      <img src={mfmImage} alt="MFM" className="header-mfm-image" />
                      <div className="header-text-status">
                        <span className="header-name">{meter.ICR || `MFM ${index + 1}`}</span>
                        <div
                          className={`status-indicator ${
                            meter.CUM_STS === 1 ? "status-green" : "status-red"
                          }`}
                          title={meter.CUM_STS === 1 ? 'Online' : 'Offline'}
                        ></div>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="unit-header">UNIT</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((param, idx) => (
                <tr key={idx} className={`param-row ${idx % 2 === 0 ? 'even' : 'odd'}`}>
                  <td className="parameter-name">{param.name}</td>
                  {filteredData.map((meter, index) => (
                    <td key={index} className="data-cell">
                      <strong>
                        {typeof meter[param.key] === 'number' 
                          ? meter[param.key].toFixed(2) 
                          : meter[param.key] || '0'}
                      </strong>
                    </td>
                  ))}
                  <td className="unit-cell">{param.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MFM;
