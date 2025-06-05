import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import sldImage from '../assets/Plant_SLD_21MWp.png';
import axios from 'axios';

const SLDScreen = () => {
  const [showSACUPopup, setShowSACUPopup] = useState(false);
  const [showICRPopups, setShowICRPopups] = useState({});
  const [inverterData, setInverterData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inverterStatus, setInverterStatus] = useState({});

  const fetchStatuses = async () => {
    try {
      const statusPromises = [1, 2, 3, 4].map(id =>
        axios.get(`http://localhost:5000/api/inverter?id=${id}`)
      );
      const responses = await Promise.all(statusPromises);
      const statusObj = {};
      responses.forEach((res, i) => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        statusObj[i + 1] = data.CUM_STS;
      });
      setInverterStatus(statusObj);
    } catch (err) {
      console.error("Error fetching inverter statuses", err);
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

  useEffect(() => {
    fetchStatuses(); // initial fetch
    const interval = setInterval(fetchStatuses, 30000); // fetch every 30 sec
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  useEffect(() => {
    const intervalIds = [];
    [1, 2, 3, 4].forEach(id => {
      const intervalId = setInterval(() => fetchInverterData(id), 30000);
      intervalIds.push(intervalId);
    });

    return () => intervalIds.forEach(clearInterval); // cleanup on unmount
  }, []);

  const handleSACUClick = () => setShowSACUPopup(true);

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

  const handleClose = () => {
    setShowSACUPopup(false);
    setShowICRPopups({});
    setInverterData({});
    setError(null);
  };

  const renderRow = (label, value, unit = '') => (
    <tr>
      <td style={{ ...cellStyle, textAlign: 'left' }}>{label}</td>
      <td style={{ ...cellStyle, color: 'lime' }}>{value}</td>
      <td style={cellStyle}>{unit}</td>
    </tr>
  );

  const renderPopup = (data) => {
    const borderColor = data?.CUM_STS === 0 ? 'lime' : 'red';
    return (
      <div style={popupStyle}>
        <div style={{ ...darkPopupBoxStyle, border: `3px solid ${borderColor}` }}>
          <h3 style={{ color: '#fff' }}>{data?.Name || "Inverter Info"}</h3>
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

          <button onClick={handleClose} style={closeBtnStyle}>Close</button>
        </div>
      </div>
    );
  };

  const buttonStyle = (id) => ({
    position: 'absolute',
    width: '120px',
    height: '40px',
    opacity: 1,
    border: `3px solid ${inverterStatus[id] === 0 ? 'lime' : 'red'}`,
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 10,
    boxSizing: 'border-box'
  });

  return (
    <Layout>
      <div style={{ position: 'relative', textAlign: 'center', marginTop: '20px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={sldImage} alt="Single Line Diagram" style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ccc' }} />

          {/* Buttons */}
          <button onClick={handleSACUClick} style={{ position: 'absolute', top: '69%', left: '41%', width: '40px', height: '15px', opacity: 0, cursor: 'pointer', zIndex: 10 }} title="PLOT1-SACU1" />
          <button onClick={() => handleICRClick(1)} style={{ ...buttonStyle(1), top: '84.4%', left: '14.9%' }} title="ICR 1-INV 1" />
          <button onClick={() => handleICRClick(2)} style={{ ...buttonStyle(2), top: '59%', left: '3.8%' }} title="ICR 1-INV 2" />
          <button onClick={() => handleICRClick(3)} style={{ ...buttonStyle(3), top: '59%', left: '5.4%' }} title="ICR 2-INV 1" />
          <button onClick={() => handleICRClick(4)} style={{ ...buttonStyle(4), top: '59%', left: '7.2%' }} title="ICR 2-INV 2" />
        </div>

        {/* Popups */}
        {showSACUPopup && (
          <div style={popupStyle}>
            <div style={popupBoxStyle}>
              <h3>SACU Info</h3>
              <p>This is a popup triggered by clicking SACU.</p>
              <button onClick={handleClose} style={closeBtnStyle}>Close</button>
            </div>
          </div>
        )}
        {[1, 2, 3, 4].map(id => showICRPopups[id] && inverterData[id] && renderPopup(inverterData[id]))}
      </div>
    </Layout>
  );
};

// Styles
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

const popupBoxStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  minWidth: '300px',
  textAlign: 'center',
};

const darkPopupBoxStyle = {
  background: '#121212',
  padding: '20px',
  borderRadius: '8px',
  minWidth: '350px',
  maxHeight: '85vh',          // limit height to 70% of viewport
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

const closeBtnStyle = {
  marginTop: '15px',
  padding: '10px 20px',
  background: 'linear-gradient(135deg, #1a237e, #3949ab)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
};


export default SLDScreen;
