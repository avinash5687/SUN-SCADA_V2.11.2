import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import sldImage from '../assets/Plant_SLD_21MWp.png';
import axios from 'axios';
import './sldScreen.css';

const SLDScreen = () => {
  const [inverterStatus, setInverterStatus] = useState({});
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

  useEffect(() => {
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="sld-wrapper">
        <img src={sldImage} alt="Single Line Diagram" className="sld-image" />
      </div>
    </Layout>
  );
};

export default SLDScreen;
