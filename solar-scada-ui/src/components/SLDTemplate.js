import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import sldImage from '../assets/Plant_SLD_21MWp.png';
import closeIcon from '../assets/close-icon.png';
import axios from 'axios';

const SLDScreen = () => {
  const [showICRPopups, setShowICRPopups] = useState({});
  const [inverterData, setInverterData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inverterStatus, setInverterStatus] = useState({});
  const [showMFMPopups, setShowMFMPopups] = useState({});
  const [mfmData, setMFMData] = useState({});
  const [mfmStatus, setMFMStatus] = useState({});

  const fetchStatuses = async () => {
    try {
      const inverterStatusPromises = [1, 2, 3, 4].map(id =>
        axios.get(`http://localhost:5000/api/inverter?id=${id}`)
      );
      const mfmStatusPromises = [1, 2, 3, 4, 5, 6, 7, 8].map(id =>
        axios.get(`http://localhost:5000/api/mfm?id=${id}`)
      );

      const [inverterResponses, mfmResponses] = await Promise.all([
        Promise.all(inverterStatusPromises),
        Promise.all(mfmStatusPromises)
      ]);

      const inverterStatusObj = {};
      inverterResponses.forEach((res, i) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        inverterStatusObj[i + 1] = data.CUM_STS;
      });
      setInverterStatus(inverterStatusObj);

      const mfmStatusObj = {};
      mfmResponses.forEach((res, i) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        mfmStatusObj[i + 1] = data.CUM_STS;
      });
      setMFMStatus(mfmStatusObj);
    } catch (err) {
      console.error("Error fetching statuses", err);
    }
  };

  const fetchInverterData = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inverter?id=${id}`);
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setInverterData(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error("API Error:", err);
      setError('Failed to fetch inverter data');
    }
  };

  const fetchMFMData = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/mfm?id=${id}`);
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      setMFMData(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      console.error("API Error (MFM):", err);
      setError('Failed to fetch MFM data');
    }
  };

  useEffect(() => {
    const fetchAllMFMData = async () => {
      try {
        const ids = [1, 2, 3, 4, 5, 6, 7, 8];
        const mfmPromises = ids.map(id => axios.get(`http://localhost:5000/api/mfm?id=${id}`));
        const responses = await Promise.all(mfmPromises);
        const allData = {};
        responses.forEach((res, index) => {
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          allData[ids[index]] = data;
        });
        setMFMData(allData);
      } catch (err) {
        console.error('Failed to preload MFM data', err);
      }
    };

    fetchStatuses();
    fetchAllMFMData();
    const interval = setInterval(fetchStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleICRClick = async (id) => {
    setLoading(true);
    setError(null);
    setShowICRPopups(prev => ({ ...prev, [id]: true }));
    try {
      await fetchInverterData(id);
    } finally {
      setLoading(false);
    }
  };

  const handleMFMClick = async (id) => {
    setLoading(true);
    setError(null);
    setShowMFMPopups(prev => ({ ...prev, [id]: true }));
    try {
      await fetchMFMData(id);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowICRPopups({});
    setShowMFMPopups({});
    setInverterData({});
    setMFMData({});
    setError(null);
  };

  const inverterButtonStyles = {
    1: { top: '86.3%', left: '27.4%' },
    2: { top: '86.3%', left: '38.1%' },
    3: { top: '86.3%', left: '53.5%' },
    4: { top: '86.3%', left: '64.2%' }
  };

  const mfmButtonStyles = {
    1: { top: '54%', left: '34.8%' },
    2: { top: '26%', left: '5%' },
    3: { top: '32%', left: '5%' },
    4: { top: '38%', left: '5%' },
    5: { top: '44%', left: '5%' },
    6: { top: '50%', left: '5%' },
    7: { top: '56%', left: '5%' },
    8: { top: '62%', left: '5%' }
  };

  const inverterButtonStyle = (id) => ({
    position: 'fixed',
    width: '120px',
    height: '40px',
    opacity: 1,
    border: `3px solid ${inverterStatus[id] === 0 ? 'lime' : 'red'}`,
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 10,
    boxSizing: 'border-box',
    transform: 'translate(-50%, -50%)',
    ...inverterButtonStyles[id]
  });

  const mfmButtonStyle = (id) => ({
    position: 'fixed',
    width: '50px',
    height: '29.7px',
    opacity: 1,
    border: `2px solid ${mfmStatus[id] === 0 ? 'lime' : 'red'}`,
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 10,
    boxSizing: 'border-box',
    transform: 'translate(-50%, -50%)',
    ...mfmButtonStyles[id]
  });

  const popupStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const popupHeaderStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
  };

  const closeIconStyle = {
    width: '24px',
    height: '24px',
    cursor: 'pointer',
  };

  const darkPopupBoxStyle = {
    background: '#121212',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '350px',
    maxHeight: '85vh',
    overflowY: 'auto',
    color: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  };

  const cellStyle = {
    border: '1px solid #555',
    padding: '8px',
    textAlign: 'center',
  };

  const renderRow = (label, value, unit = '') => (
    <tr>
      <td style={{ ...cellStyle, textAlign: 'left' }}>{label}</td>
      <td style={{ ...cellStyle, color: 'lime' }}>{value}</td>
      <td style={cellStyle}>{unit}</td>
    </tr>
  );

  const renderPopupHeader = () => (
    <div style={popupHeaderStyle}>
      <img src={closeIcon} alt="Close" style={closeIconStyle} onClick={handleClose} />
    </div>
  );

  const renderPopup = (data) => {
    const borderColor = data?.CUM_STS === 0 ? 'lime' : 'red';
    return (
      <div style={popupStyle}>
        <div style={{ ...darkPopupBoxStyle, border: `3px solid ${borderColor}` }}>
          {renderPopupHeader()}
          <h3 style={{ color: '#fff' }}>{data?.Name || 'Inverter Info'}</h3>
          {loading && <p style={{ color: '#fff' }}>Loading data...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#1a237e', color: '#fff' }}>
                <th style={cellStyle}>PARAMETER</th>
                <th style={cellStyle}>VALUE</th>
                <th style={cellStyle}>UNIT</th>
              </tr>
            </thead>
            <tbody>
              {renderRow('ID', data.ID)}
              {renderRow('Active Power', data.Active_Power, 'kW')}
              {renderRow('DC Power', data.DC_Power, 'kW')}
              {renderRow('Reactive Power', data.React_Power, 'kVAR')}
              {renderRow('PF', data.PF)}
              {renderRow('Frequency', data.Frequency, 'Hz')}
              {renderRow('Efficiency', data.Efficiancy, '%')}
              {renderRow('Voltage RY', data.Voltage_RY, 'V')}
              {renderRow('Voltage YB', data.Voltage_YB, 'V')}
              {renderRow('Voltage BR', data.Voltage_BR, 'V')}
              {renderRow('Current R', data.Current_R, 'A')}
              {renderRow('Current Y', data.Current_Y, 'A')}
              {renderRow('Current B', data.Current_B, 'A')}
              {renderRow('Today Energy', data.E_Today, 'kWh')}
              {renderRow('Total Energy', data.E_Total, 'kWh')}
              <tr>
                <td style={{ ...cellStyle, textAlign: 'left' }}>Status</td>
                <td style={{ ...cellStyle, color: data.CUM_STS === 1 ? 'lime' : 'red' }}>
                  {data.CUM_STS === 1 ? 'Running' : 'Stop'}
                </td>
                <td style={cellStyle}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMFMPopup = (data, id) => {
    if (!data) return null;
    const borderColor = data?.CUM_STS === 0 ? 'lime' : 'red';
    return (
      <div style={popupStyle}>
        <div style={{ ...darkPopupBoxStyle, border: `3px solid ${borderColor}` }}>
          {renderPopupHeader()}
          <h3 style={{ color: '#fff' }}>MFM {id}</h3>
          {loading && <p style={{ color: '#fff' }}>Loading data...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#1a237e', color: '#fff' }}>
                <th style={cellStyle}>PARAMETER</th>
                <th style={cellStyle}>VALUE</th>
                <th style={cellStyle}>UNIT</th>
              </tr>
            </thead>
            <tbody>
              {renderRow('ID', id)}
              {renderRow('Active Power', data.AC_PWR || 'N/A', 'kW')}
              {renderRow('Reactive Power', data.RCT_PWR || 'N/A', 'kVAR')}
              {renderRow('Apparent Power', data.APP_PWR || 'N/A', 'kVA')}
              {renderRow('R Phase Voltage', data.RY_VLT || 'N/A', 'V')}
              {renderRow('Y Phase Voltage', data.YB_VLT || 'N/A', 'V')}
              {renderRow('B Phase Voltage', data.BR_VLT || 'N/A', 'V')}
              {renderRow('R Phase Current', data.R_L_CRNT || 'N/A', 'A')}
              {renderRow('Y Phase Current', data.Y_L_CRNT || 'N/A', 'A')}
              {renderRow('B Phase Current', data.B_L_CRNT || 'N/A', 'A')}
              {renderRow('Frequency', data.FRQ || 'N/A', 'Hz')}
              {renderRow('Power Factor', data.PF || 'N/A')}
              {renderRow('Total Active Export', data.TOT_EXP_KWh || 'N/A', 'kWh')}
              {renderRow('Total Active Import', data.TOT_IXP_KWh || 'N/A', 'kWh')}
              <tr>
                <td style={{ ...cellStyle, textAlign: 'left' }}>Status</td>
                <td style={{ ...cellStyle, color: data.CUM_STS === 0 ? 'lime' : 'red' }}>
                  {data.CUM_STS === 0 ? 'Running' : 'Stop'}
                </td>
                <td style={cellStyle}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <img src={sldImage} alt="Single Line Diagram" style={{ width: '100vw', height: '95vh', objectFit: 'contain', position: 'fixed', top: 35, left: 0 }} />
          {[1, 2, 3, 4].map(id => (
            <button
              key={`inv-${id}`}
              onClick={() => handleICRClick(id)}
              style={inverterButtonStyle(id)}
              title={`ICR ${Math.ceil(id / 2)}-INV ${((id - 1) % 2) + 1}`}
            />
          ))}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(id => (
            <button
              key={`mfm-${id}`}
              onClick={() => handleMFMClick(id)}
              style={mfmButtonStyle(id)}
              title={`MFM ${id}`}
            >
              MFM {id}
            </button>
          ))}
        </div>
        {Object.entries(showICRPopups).map(([id, isVisible]) => isVisible && inverterData[id] && renderPopup(inverterData[id]))}
        {Object.entries(showMFMPopups).map(([id, isVisible]) => {
          const numericId = parseInt(id, 10);
          return isVisible && mfmData[numericId] && renderMFMPopup(mfmData[numericId], numericId);
        })}
      </div>
    </Layout>
  );
};

export default SLDScreen;
