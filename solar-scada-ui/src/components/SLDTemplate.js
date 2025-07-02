import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import sldImage from '../assets/Plant_SLD_21MWp.png';
import axios from 'axios';
import './sldScreen.css';

const SLDScreen = () => {
  const [inverterStatus, setInverterStatus] = useState({});
  const [mfmStatus, setMFMStatus] = useState({});
  const [popupData, setPopupData] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 100, y: 100 });

  const fetchStatuses = async () => {
    try {
      const inverterIds = [1, 2, 3, 4];
      const mfmIds = [1, 2, 3, 4, 5, 6, 7, 8];

      const inverterStatusPromises = inverterIds.map(id =>
        axios.get(`http://localhost:5000/api/inverter?id=${id}`)
      );
      const mfmStatusAll = await axios.get(`http://localhost:5000/api/mfm`);

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

    return Object.entries(rawData).map(([key, value]) => {
      const map = paramMap[key];
      return map
        ? {
            parameter: map.parameter,
            value: value,
            unit: map.unit,
          }
        : null;
    }).filter(Boolean);
  };

  const handleClick = (type, id, event) => {
    const raw = type === 'inverter' ? inverterStatus[id] : mfmStatus[id];
    if (!raw) return;
    const formatted = formatDataForPopup(raw, type);
    const rect = event.target.getBoundingClientRect();
    const title = raw?.Name || raw?.ICR || (type.toUpperCase() + ' ' + id);
    const centerX = window.innerWidth / 2 - 200; // Adjust width offset (~popup width)
    const centerY = window.innerHeight / 2 - 220; // Adjust height offset (~popup height)
    setPopupPosition({ x: centerX, y: centerY });
    setPopupData({ data: formatted, title });
  };

  const closePopup = () => setPopupData(null);

  const mfmPositions = [
    { id: 1, top: '52.7%', left: '34.75%' },
    { id: 2, top: '72.89%', left: '23.4%' },
    { id: 3, top: '31.7%', left: '34.75%' },
    { id: 4, top: '35.7%', left: '34.75%' },
    { id: 5, top: '52.6%', left: '59%' },
    { id: 6, top: '70.2%', left: '72.8%' },
    { id: 7, top: '31.7%', left: '59%' },
    { id: 8, top: '35.7%', left: '59%' },
  ];

  const inverterPositions = [
    { id: 1, top: '84.4%', left: '26.3%' },
    { id: 2, top: '84.4%', left: '36.2%' },
    { id: 3, top: '84.3%', left: '50.6%' },
    { id: 4, top: '84.3%', left: '60.5%' },
  ];

  return (
    <Layout>
      <div className="sld-wrapper">
        <div className="sld-container">
          <img src={sldImage} alt="Single Line Diagram" className="sld-image" />
          <div className="marker-layer">
            {mfmPositions.map(pos => {
              const status = mfmStatus[pos.id];
              const isRed = status && status.CUM_STS > 0;

              // Custom size for MFM ID 2 and 6
              const isWide = pos.id === 2 || pos.id === 6;
              const width = isWide ? '63px' : '35px';
              const height = isWide ? '20px' : '18px'; // custom height for 2 and 6 only

              return (
                <div
                  key={`mfm-${pos.id}`}
                  className={`click-zone mfm ${isRed ? 'red-border' : 'green-border'}`}
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width,
                    height,
                  }}
                  onClick={(e) => handleClick('mfm', pos.id, e)}
                  title={status?.ICR || `MFM ${pos.id}`}
                />
              );
            })}

            {inverterPositions.map(pos => {
              const status = inverterStatus[pos.id];
              const isRed = status && status.CUM_STS > 0;
              return (
                <div
                  key={`inverter-${pos.id}`}
                  className={`click-zone inverter ${isRed ? 'red-border' : 'green-border'}`}
                  style={{ top: pos.top, left: pos.left }}
                  onClick={(e) => handleClick('inverter', pos.id, e)}
                  title={status?.Name || `Inverter ${pos.id}`}
                />
              );
            })}
          </div>
        </div>

        {popupData && (
          <div className="scada-popup" style={{ top: popupPosition.y, left: popupPosition.x }}>
            <div className="popup-title-bar">
              <span>{popupData.title}</span>
              <button className="close-btn" onClick={closePopup}>×</button>
            </div>
            <table className="popup-table">
              <thead>
                <tr>
                  <th>PARAMETER</th>
                  <th>VALUE</th>
                  <th>UNIT</th>
                </tr>
              </thead>
              <tbody>
                {popupData.data.map((item, index) => (
                  <tr key={index}>
                    <td>{item.parameter}</td>
                    <td className="value-cell">{item.value}</td>
                    <td>{item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SLDScreen;
