import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import FormulaBox from "../components/FormulaBox";
import axios from "axios";

const FormulaScreen = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://localhost:5000/api/dashboard/plant-kpi")
        .then(response => {
          setData(response.data[0]); // extract the first object from array
        })
        .catch(error => {
          console.error("Failed to fetch formula data:", error);
        });
    };
  
    fetchData(); // fetch once on mount
  
    const intervalId = setInterval(fetchData, 30000); // fetch every 30 seconds
  
    return () => clearInterval(intervalId); // clear interval on unmount
  }, []);
  
 
  if (!data) return <Layout><p>Loading...</p></Layout>;

  // Calculate formulas using actual fetched values
  const poaResult = ((data.AVG_POA / 1000) * parseFloat(data.P_RUN)).toFixed(2);
  const plantAvailability = (1 - (data.INV_DOWN / data.OP_COUNT)) * 100;
  const GA = (1 - (data.OG_DOWN / data.PLANT_AVAIL)) * 100;
  const pr = ((data.P_EXP / (data.POA * data.DC_CAP)) * 100).toFixed(2);
  const acCuf = ((data.P_EXP / (24 * data.AC_CAP)) * 100).toFixed(2);
  const dcCuf = ((data.P_EXP / (24 * data.DC_CAP)) * 100).toFixed(2);

  return (
    <Layout>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        <FormulaBox
          title="SOLAR Average Irradiation"
          text="POA = (Average Radiation(Tilted)/1000) * Today Operation Hrs"
          formula={`POA = (${data.AVG_POA} / 1000) * ${data.P_RUN} = ${poaResult}`}
        />
        <FormulaBox
          title="Plant Availability (%)"
          text="PA(%) = 1 - (Breakdown Min / (Today Operation Min * No of Inverter) * 100"
          formula={`PA(%) = 1 - (${data.INV_DOWN} / ${data.OP_COUNT}) * 100 = ${plantAvailability.toFixed(2)}%`}
        />
        <FormulaBox
          title="Grid Availability (%)"
          text="GA(%) = 1 - (OG Breakdown Min / Today Operation Min) * 100"
          formula={`GA(%) = 1 - (${data.OG_DOWN} / ${data.PLANT_AVAIL}) * 100 = ${GA.toFixed(2)}%`}
        />
        <FormulaBox
          title="Performance Ratio (%)"
          text="PR(%) = (Total Power Generation / (POA ACC * Plant Capacity)) * 100"
          formula={`PR (%) = (${data.P_EXP} / (${data.POA} * ${data.DC_CAP})) * 100 = ${pr}%`}
        />
        <FormulaBox
          title="AC CUF (%)"
          text="AC CUF (%) = (Total Power Generation / (24 * Plant AC Capacity)) * 100"
          formula={`AC CUF (%) = (${data.P_EXP} / (24 * ${data.AC_CAP})) * 100 = ${acCuf}%`}
        />
        <FormulaBox
          title="DC CUF (%)"
          text="DC CUF (%) = (Total Power Generation / (24 * Plant DC Capacity)) * 100"
          formula={`DC CUF (%) = (${data.P_EXP} / (24 * ${data.DC_CAP})) * 100 = ${dcCuf}%`}
        />
      </div>
    </Layout>
  );
};

export default FormulaScreen;
