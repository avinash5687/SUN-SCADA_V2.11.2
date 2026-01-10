import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tooltip, styled, tooltipClasses } from "@mui/material";
import "./MFM.css";
import mfmImage from '../assets/Meter.jpg';
import { API_ENDPOINTS } from "../apiConfig";

// Custom styled tooltip matching the theme
const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.98) 0%, rgba(35, 45, 63, 0.98) 100%)',
    backdropFilter: 'blur(10px)',
    color: '#e0e6ed',
    fontSize: '0.8rem',
    fontWeight: 500,
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(100, 149, 237, 0.4)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(100, 149, 237, 0.2)',
    letterSpacing: '0.3px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(26, 54, 93, 0.98)',
    '&::before': {
      border: '1px solid rgba(100, 149, 237, 0.4)',
      background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.98) 0%, rgba(35, 45, 63, 0.98) 100%)',
    },
  },
}));

const MFM = () => {
  const [mfmData, setMfmData] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [activeBlock, setActiveBlock] = useState('BLOCK1');
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // MFM IDs for different blocks
  const mfmIds = [1, 2, 3, 4, 5, 6, 7, 8];

  // Initialize loading states
  useEffect(() => {
    const initialLoadingStates = {};
    mfmIds.forEach(id => {
      initialLoadingStates[id] = true;
    });
    setLoadingStates(initialLoadingStates);
  }, []);

  const fetchMFMData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const API_TIMEOUT = 10000;
      const axiosConfig = { timeout: API_TIMEOUT };

      console.time('MFM Table API Fetch');

      // Try to fetch all MFM data first (bulk endpoint)
      try {
        const response = await axios.get(API_ENDPOINTS.mfm.getAll, axiosConfig);
        
        if (response.data && Array.isArray(response.data)) {
          const mfmDataObject = {};
          const newLoadingStates = {};
          
          // Process each MFM data
          response.data.forEach(item => {
            if (item.ID && mfmIds.includes(item.ID)) {
              mfmDataObject[item.ID] = item;
              newLoadingStates[item.ID] = false;
            }
          });

          // Mark remaining IDs as not loading (no data available)
          mfmIds.forEach(id => {
            if (!mfmDataObject[id]) {
              newLoadingStates[id] = false;
            }
          });

          setMfmData(prev => ({ ...prev, ...mfmDataObject }));
          setLoadingStates(prev => ({ ...prev, ...newLoadingStates }));
        }
      } catch (bulkError) {
        console.warn('Bulk MFM API failed, trying individual calls:', bulkError.message);
        
        // Fallback to individual API calls
        mfmIds.forEach(async (id) => {
          try {
            const response = await axios.get(API_ENDPOINTS.mfm.getAll, { 
              params: { id }, 
              ...axiosConfig 
            });
            
            if (response.data) {
              const data = Array.isArray(response.data) ? response.data[0] : response.data;
              if (data) {
                setMfmData(prev => ({ ...prev, [id]: data }));
                setLoadingStates(prev => ({ ...prev, [id]: false }));
              }
            }
          } catch (error) {
            console.warn(`MFM ${id} API failed:`, error.message);
            setLoadingStates(prev => ({ ...prev, [id]: false }));
          }
        });
      }

      // Mark initial load as complete after first attempt
      if (initialLoad) {
        setTimeout(() => setInitialLoad(false), 1000);
      }

      console.timeEnd('MFM Table API Fetch');
      console.log('✅ MFM table data fetch initiated');

    } catch (error) {
      console.error("Error fetching MFM data:", error);
      // Set all loading states to false on general error
      const errorStates = {};
      mfmIds.forEach(id => {
        errorStates[id] = false;
      });
      setLoadingStates(errorStates);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMFMData(false);
    const interval = setInterval(() => fetchMFMData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter data based on active block with specific meter names
  const getFilteredData = () => {
    const dataArray = Object.values(mfmData).filter(Boolean);
    
    if (activeBlock === 'BLOCK1') {
      // Block 1 specific meters
      const block1Meters = [
        'BLOCK-1_HT-MFM',
        'BLOCK-1_AUX-MFM', 
        'BLOCK-1_MAIN-METER',
        'BLOCK-1_CHECK-METER'
      ];
      
      return dataArray.filter(meter => {
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
      
      return dataArray.filter(meter => {
        const meterName = meter.ICR || '';
        return !block1Meters.some(blockMeter => 
          meterName.includes(blockMeter) || meterName === blockMeter
        );
      });
    }
  };

  // Get loading MFM data for current block
  const getLoadingDataForBlock = () => {
    if (activeBlock === 'BLOCK1') {
      // Show loading for first 4 MFMs for Block 1
      return mfmIds.slice(0, 4).filter(id => loadingStates[id]);
    } else {
      // Show loading for last 4 MFMs for Block 2
      return mfmIds.slice(4, 8).filter(id => loadingStates[id]);
    }
  };

  const filteredData = getFilteredData();
  const loadingDataForBlock = getLoadingDataForBlock();

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

  // Skeleton Components
  const SkeletonHeaderCell = ({ id }) => (
    <th className="skeleton-header-cell">
      <div className="skeleton-mfm-header-content">
        <div className="skeleton-mfm-image"></div>
        <div className="skeleton-header-text">
          <div className="skeleton-name"></div>
          <div className="skeleton-status-dot"></div>
        </div>
      </div>
    </th>
  );

  const SkeletonDataCell = () => (
    <td className="skeleton-data-cell">
      <div className="skeleton-data-content"></div>
    </td>
  );

  // Full MFM Table Skeleton Component
  const MFMTableSkeleton = () => (
    <div className="mfm-table-skeleton">
      <div className="skeleton-table-wrapper">
        <table className="skeleton-mfm-table">
          <thead>
            <tr>
              <th className="skeleton-parameter-header">
                <div className="skeleton-param-label"></div>
              </th>
              {Array.from({ length: 4 }).map((_, idx) => (
                <th key={idx} className="skeleton-header-cell">
                  <div className="skeleton-mfm-header-content">
                    <div className="skeleton-mfm-image"></div>
                    <div className="skeleton-header-text">
                      <div className="skeleton-name"></div>
                      <div className="skeleton-status-dot"></div>
                    </div>
                  </div>
                </th>
              ))}
              <th className="skeleton-unit-header">
                <div className="skeleton-unit-label"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }).map((_, rowIdx) => (
              <tr key={rowIdx} className={`skeleton-param-row ${rowIdx % 2 === 0 ? 'even' : 'odd'}`}>
                <td className="skeleton-parameter-name">
                  <div className="skeleton-param-text"></div>
                </td>
                {Array.from({ length: 4 }).map((_, colIdx) => (
                  <td key={colIdx} className="skeleton-data-cell">
                    <div className="skeleton-data-content"></div>
                  </td>
                ))}
                <td className="skeleton-unit-cell">
                  <div className="skeleton-unit-text"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Check if we should show the table (has data or loading)
  const shouldShowTable = filteredData.length > 0 || loadingDataForBlock.length > 0;
  const totalColumns = Math.max(filteredData.length + loadingDataForBlock.length, 1);

  return (
    <div className="mfm-container">
      {/* Header with Title and Block Buttons */}
      <div className="mfm-header">
        <h2 className="mfm-title">Multi Functional Meter Data Overview</h2>
        
        <div className="block-controls">

          {/* Data Info */}
          <div className="data-info">
            {/* <div className="active-block-indicator">
              <span className={`block-status ${activeBlock.toLowerCase()}`}>
                {activeBlock === 'BLOCK1' ? '● BLOCK 1' : '● BLOCK 2'}
              </span>
              <span className="meter-count">
                {filteredData.length + loadingDataForBlock.length} Meter{(filteredData.length + loadingDataForBlock.length) !== 1 ? 's' : ''}
              </span>
            </div> */}
            {refreshing && (
              <div className="refresh-indicator">
                <div className="refresh-spinner"></div>
                <span>Refreshing...</span>
              </div>
            )}
          </div>

          <div className="block-buttons">
            <button
              className={`block-btn ${activeBlock === 'BLOCK1' ? 'active' : ''}`}
              onClick={() => handleBlockSwitch('BLOCK1')}
              disabled={refreshing}
            >
              {/* <span className="btn-icon">🏢</span> */}
              BLOCK 1
            </button>
            <button
              className={`block-btn ${activeBlock === 'BLOCK2' ? 'active' : ''}`}
              onClick={() => handleBlockSwitch('BLOCK2')}
              disabled={refreshing}
            >
              {/* <span className="btn-icon">🏭</span> */}
              BLOCK 2
            </button>
          </div>

        </div>
      </div>

      {/* Loading State - Show skeleton while loading */}
      {initialLoad && Object.values(loadingStates).every(state => state) && (
        <MFMTableSkeleton />
      )}

      {/* Table Content or No Data Message */}
      {(!initialLoad || !Object.values(loadingStates).every(state => state)) && (
        <>
          {!shouldShowTable ? (
            <div className="no-data-message">
              <div className="no-data-icon">📊</div>
              <h3>No Data Available</h3>
              <p>No MFM data found for {activeBlock}. Please check your connection or try refreshing.</p>
              <button className="retry-btn" onClick={() => fetchMFMData(false)}>
                🔄 Retry
              </button>
            </div>
          ) : (
            <div className="mfm-table-wrapper">
              <table className="mfm-table">
                <thead>
                  <tr>
                    <th className="parameter-header">Parameters</th>
                    {/* Real Data Headers */}
                    {filteredData.map((meter, index) => (
                      <th key={`real-${index}`}>
                        <div className="mfm-header-content">
                          <img src={mfmImage} alt="MFM" className="header-mfm-image" />
                          <div className="header-text-status">
                            <span className="header-name">{meter.ICR || `MFM ${index + 1}`}</span>
                            <StyledTooltip 
                              title={meter.CUM_STS === 1 ? 'Online' : 'Offline'} 
                              placement="top" 
                              arrow
                            >
                              <div
                                className={`status-indicator ${
                                  meter.CUM_STS === 1 ? "status-green" : "status-red"
                                }`}
                              ></div>
                            </StyledTooltip>
                          </div>
                        </div>
                      </th>
                    ))}
                    {/* Skeleton Headers */}
                    {loadingDataForBlock.map((id, index) => (
                      <SkeletonHeaderCell key={`skeleton-header-${id}`} id={id} />
                    ))}
                    <th className="unit-header">UNIT</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.map((param, idx) => (
                    <tr key={idx} className={`param-row ${idx % 2 === 0 ? 'even' : 'odd'}`}>
                      <td className="parameter-name">{param.name}</td>
                      {/* Real Data Cells */}
                      {filteredData.map((meter, index) => (
                        <td key={`real-${index}`} className="data-cell">
                          <strong>
                            {typeof meter[param.key] === 'number' 
                              ? meter[param.key].toFixed(2) 
                              : meter[param.key] || '0'}
                          </strong>
                        </td>
                      ))}
                      {/* Skeleton Data Cells */}
                      {loadingDataForBlock.map((id, index) => (
                        <SkeletonDataCell key={`skeleton-data-${id}-${idx}`} />
                      ))}
                      <td className="unit-cell">{param.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MFM;
