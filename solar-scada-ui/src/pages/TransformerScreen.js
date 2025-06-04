import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TransformerScreen.css';

const TransformerCard = ({ title, values }) => (
  <div className="transformer-card">
    <div className="card-header">{title}</div>
    <div className="card-table">
      <div className="table-header">
        <span>PARAMETERS</span>
        <span>VALUES</span>
      </div>
      {Object.entries(values).map(([label, value], index) => (
        <div className="table-row" key={index}>
          <span>{label}</span>
          <span>: {value}</span>
        </div>
      ))}
    </div>
  </div>
);

const TransformerScreen = () => {
  const [transformerData, setTransformerData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transformer');

      // Format API response to fit card structure
      const formattedData = res.data.map((item) => ({
        title: item.NAME,
        values: {
          'LV1 Winding Temperature': `${item.LV1_WT.toFixed(2)} °C`,
          'LV2 Winding Temperature': `${item.LV2_WT.toFixed(2)} °C`,
          'HV Winding Temperature': `${item.HV_WT.toFixed(2)} °C`,
          'Oil Temperature': `${item.OIL_TEMP.toFixed(2)} °C`
        }
      }));

      setTransformerData(formattedData);
    } catch (error) {
      console.error('Error fetching transformer data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="transformer-container">
      {transformerData.map((transformer, index) => (
        <TransformerCard
          key={index}
          title={transformer.title}
          values={transformer.values}
        />
      ))}
    </div>
  );
};

export default TransformerScreen;
