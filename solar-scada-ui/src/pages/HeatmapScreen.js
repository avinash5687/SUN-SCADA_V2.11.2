import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../apiConfig";

// --- Inline styles for universal layout ---
const universalStyles = {
  screen: { width: "100%", height: "calc(100vh - 50px)", background: "#f8f9fa", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 8 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px", background: "linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.85))", borderBottom: "1px solid #e9ecef", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", fontWeight: 600, fontSize: "1.1rem", color: "#1a3b5d", minHeight: 38 },
  grid: { flex: 1, padding: "20px", overflow: "auto", display: "flex", flexDirection: "column", gap: "18px" },
  row: { display: "flex", alignItems: "stretch", marginBottom: 18, background: "white", borderRadius: 12, boxShadow: "0 4px 8px rgba(0,0,0,0.08)", overflow: "hidden", transition: "all 0.3s ease" },
  categoryHeader: { minWidth: 150, padding: "18px", background: "linear-gradient(135deg,#2c3e50,#34495e)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", wordBreak: "break-word", textAlign: "left" },
  cells: { flex: 1, display: "grid", gap: 8, padding: 11, alignItems: "center" },
  cell: { aspectRatio: 1, borderRadius: 12, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 2px 4px rgba(0,0,0,0.09)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)", fontWeight: 700, fontSize: "1.1rem", color: "#fff" },
  tooltip: { position: "fixed", background: "linear-gradient(135deg,#2c3e50,#34495e)", color: "white", borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,0.32)", border: "2px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", zIndex: 1000, pointerEvents: "none", maxWidth: "300px", minWidth: "200px", padding: "12px 16px", fontSize: "0.9rem", lineHeight: "1.4", transition: "opacity 0.2s ease, transform 0.2s ease" }
};
const heatmapCategories = [
  { key: "TotalEnergy", deviationKey: "DeviationPercentage", label: "Daily Energy", unit: "kWh" },
  { key: "AC_PWR", deviationKey: "Dev_PerAC", label: "Active Power", unit: "kW" },
  { key: "SPC_YLD", deviationKey: "Dev_Per_SPC_YLD", label: "Specific Yield", unit: "kWh/kWp" },
  { key: "PR", deviationKey: "Dev_Per_PR", label: "Performance\nRatio", unit: "%" }, // FIX: break line
];

const getStatus = (deviation) => {
  if (deviation < 25) return { text: "Excellent", color: "#27ae60", emoji: "🟢" };
  if (deviation < 50) return { text: "Good", color: "#f1c40f", emoji: "🟡" };
  if (deviation < 75) return { text: "Warning", color: "#f39c12", emoji: "🟠" };
  return { text: "Critical", color: "#e74c3c", emoji: "🔴" };
};

const getColor = deviation => {
  if (deviation < 25) return "rgba(39,174,96,0.87)";
  if (deviation < 50) return "rgba(241,196,15,0.85)";
  if (deviation < 75) return "rgba(243,156,18,0.86)";
  return "rgba(231,76,60,0.82)";
};

const Legend = () => {
  const legendData = [
    { color: "rgba(39,174,96,0.87)", label: "0-25% Excellent", emoji: "🟢" },
    { color: "rgba(241,196,15,0.85)", label: "25-50% Good", emoji: "🟡" },
    { color: "rgba(243,156,18,0.86)", label: "50-75% Warning", emoji: "🟠" },
    { color: "rgba(231,76,60,0.82)", label: "75%+ Critical", emoji: "🔴" }
  ];
  return (
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      <span style={{fontWeight:"600",fontSize:"1.03rem",color:"#2c3e50",marginRight:16}}>📊 Performance Deviation:</span>
      {legendData.map((item,i)=>(
        <span key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",borderRadius:"10px",background:"#f5f6fa",fontWeight:600}}>
          <span style={{background:item.color,borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.07rem",boxShadow:"0 2px 4px rgba(0,0,0,0.12)"}}>{item.emoji}</span>
          <span style={{fontSize:"0.9rem",color:"#222"}}>{item.label}</span>
        </span>
      ))}
    </div>
  )
}

const HeatmapScreen = () => {
  const tooltipRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({ left: -9999, top: -9999, placement: "bottom" });
  const [inverterData, setInverterData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCell, setActiveCell] = useState(null);

  const fetchInverterData = useCallback(async () => {
    try {
      if (inverterData.length === 0) setLoading(true);
      const response = await axios.get(API_ENDPOINTS.inverter.heatmap);
      if (response.data && Array.isArray(response.data)) {
        if (inverterData.length > 0) setPreviousData(inverterData);
        setInverterData(response.data);
      }
    } catch {
      if (inverterData.length === 0 && previousData.length > 0) setInverterData(previousData);
    } finally { setLoading(false); }
  }, [inverterData, previousData]);

  useEffect(() => { fetchInverterData(); const intervalId = setInterval(fetchInverterData, 30000); return () => clearInterval(intervalId); }, [fetchInverterData]);

  const calculateTooltipPosition = useCallback((cellElement) => {
    if (!cellElement || !tooltipRef.current) return { left: -9999, top: -9999, placement: "bottom" };
    const cellRect = cellElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 0; // smaller gap
    let placement = "bottom";

    let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
    let top = cellRect.bottom + spacing;
    if (top + tooltipRect.height > window.innerHeight - spacing) {
      top = cellRect.top - tooltipRect.height - spacing;
      placement = "top";
    }
    return { left: Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8)), top: Math.max(8, top), placement };
  }, []);

  const handleMouseOver = (event, item, category) => {
    const deviation = Number(item[category.deviationKey]) || 0;
    const currentValue = Number(item[category.key]) || 0;
    const maxValue = Math.max(...inverterData.map(d => Number(d[category.key]) || 0));
    const status = getStatus(deviation);
    setActiveCell(`${item.ID}-${category.key}`);
    setTooltipContent({ status, device: item.Inverter_Name || `Device ${item.ID}`, current: currentValue.toFixed(2), max: maxValue.toFixed(2), deviation: deviation.toFixed(1), unit: category.unit, label: category.label });
    setTooltipVisible(true);
    setTimeout(() => setTooltipStyle(calculateTooltipPosition(event.currentTarget)), 10);
  };

  const handleMouseMove = (event) => { if (tooltipVisible) setTooltipStyle(calculateTooltipPosition(event.currentTarget)); };
  const handleMouseOut = () => { setTooltipVisible(false); setActiveCell(null); };

  const displayData = inverterData.length > 0 ? inverterData : previousData;
  const maxColumns = Math.max(0, ...heatmapCategories.map(cat => displayData.filter(item => item.hasOwnProperty(cat.key)).length));

  return (
    <div style={universalStyles.screen}>
      <div style={universalStyles.header}><span>Performance Heatmap</span><Legend /></div>
      <div style={universalStyles.grid}>
        {(!loading && displayData.length > 0) && heatmapCategories.map((category) => (
          <div key={category.key} style={universalStyles.row}>
            <div style={universalStyles.categoryHeader}>
              {category.label.split("\n").map((line,i)=>(<span key={i} style={{fontSize:"1.09em",fontWeight:"700"}}>{line}</span>))}
              <span style={{ fontSize:"0.80em", background:"rgba(255,255,255,0.22)", padding:"3px 9px", borderRadius:"10px", marginTop:6 }}>{category.unit}</span>
            </div>
            <div style={{...universalStyles.cells, gridTemplateColumns: `repeat(${maxColumns}, minmax(120px, 1fr))`}}>
              {displayData.map((item) => {
                const deviation = Number(item[category.deviationKey]) || 0;
                const inverterLabel = item.Inverter_Name ? (item.Inverter_Name.includes("_") ? item.Inverter_Name.split("_")[1] : item.Inverter_Name) : `D${item.ID}`;
                return (
                  <div key={`${item.ID}-${category.key}`} style={{...universalStyles.cell, backgroundColor: getColor(deviation), border: activeCell === `${item.ID}-${category.key}` ? "3px solid #3498db" : "2px solid rgba(255,255,255,0.3)", transform: activeCell === `${item.ID}-${category.key}` ? "scale(1.05)" : "scale(1)"}} onMouseOver={e => handleMouseOver(e, item, category)} onMouseMove={handleMouseMove} onMouseOut={handleMouseOut}>
                    <span style={{fontSize:"1.03em",fontWeight:"800",color:"#fff"}}>{Number(item[category.key] || 0).toFixed(1)}</span>
                    <span style={{fontSize:"0.71em",fontWeight:"600",color:"rgba(255,255,255,0.85)",background:"rgba(0,0,0,0.15)",padding:"2px 9px",borderRadius:"7px"}}>{inverterLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Tooltip with arrow */}
        <div ref={tooltipRef} style={{...universalStyles.tooltip, left: tooltipStyle.left, top: tooltipStyle.top, opacity: tooltipVisible ? 1 : 0, visibility: tooltipVisible ? "visible" : "hidden", transform: `translateY(${tooltipVisible ? 0 : '10px'})`}}>
          {tooltipVisible && (
            <>
              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", ...(tooltipStyle.placement === "top" ? { bottom: -8, borderTop: "8px solid #2c3e50" } : { top: -8, borderBottom: "8px solid #2c3e50" }) }}></div>
              <div style={{ fontWeight: 700, color: tooltipContent.status?.color, fontSize:"1.05em", marginBottom:6 }}>{tooltipContent.status?.emoji} {tooltipContent.status?.text}</div>
              <div><strong>Device:</strong> {tooltipContent.device}</div>
              <div><strong>{tooltipContent.label.replace("\n"," ") }:</strong> {tooltipContent.current} {tooltipContent.unit}</div>
              <div><strong>Deviation:</strong> <span style={{color: tooltipContent.status?.color}}>{tooltipContent.deviation}%</span></div>
              <hr style={{margin:"6px 0",border:"none",borderTop:"1px solid rgba(255,255,255,0.2)"}} />
              <div style={{fontSize:"0.85em",opacity:0.9}}><strong>Best:</strong> {tooltipContent.max} {tooltipContent.unit}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeatmapScreen;
