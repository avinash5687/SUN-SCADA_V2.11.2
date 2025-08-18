import React, { useRef, useState, useCallback, useEffect } from "react";
import "./Heatmap.css";

const heatmapCategories = [
  { key: "TotalEnergy", deviationKey: "DeviationPercentage", label: "Daily Energy", unit: "kWh" },
  { key: "AC_PWR", deviationKey: "Dev_PerAC", label: "Active Power", unit: "kW" },
  { key: "SPC_YLD", deviationKey: "Dev_Per_SPC_YLD", label: "Specific Yield", unit: "kWh/kWp" },
  { key: "PR", deviationKey: "Dev_Per_PR", label: "Performance Ratio", unit: "%" },
];

const Heatmap = ({ data }) => {
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipStyle, setTooltipStyle] = useState({ left: 0, top: 0 });
  const [activeCell, setActiveCell] = useState(null);

  const getStatus = (deviation) => {
    if (deviation < 25) return { text: "Excellent", emoji: "🟢", class: "excellent" };
    if (deviation < 50) return { text: "Good", emoji: "🟡", class: "good" };
    if (deviation < 75) return { text: "Warning", emoji: "🟠", class: "warning" };
    return { text: "Critical", emoji: "🔴", class: "critical" };
  };

  const getPerformanceTrend = (currentValue, maxValue) => {
    const percentage = (currentValue / maxValue) * 100;
    if (percentage >= 90) return { text: "Top Performer", emoji: "⭐", class: "top" };
    if (percentage >= 75) return { text: "High Performer", emoji: "📈", class: "high" };
    if (percentage >= 50) return { text: "Average", emoji: "➖", class: "average" };
    return { text: "Needs Attention", emoji: "⚠️", class: "low" };
  };

  const smartTooltipPositioning = useCallback((cellRect, tooltip) => {
    if (!tooltip || !containerRef.current) return { left: 0, top: 0 };

    const tooltipRect = tooltip.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2);
    let top = cellRect.top - tooltipRect.height - 12;

    // Smart vertical positioning
    if (top < containerRect.top + 10) {
      // Not enough space above, show below
      top = cellRect.bottom + 12;
    }
    
    if (top + tooltipRect.height > viewportHeight - 10) {
      // Not enough space below either, show beside
      top = cellRect.top + (cellRect.height / 2) - (tooltipRect.height / 2);
      left = cellRect.right + 12;
      
      if (left + tooltipRect.width > viewportWidth - 10) {
        // Show on left side instead
        left = cellRect.left - tooltipRect.width - 12;
      }
    }

    // Smart horizontal positioning
    if (left < containerRect.left + 10) {
      left = containerRect.left + 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }

    return { left, top };
  }, []);

  const handleMouseOver = useCallback((event, item, category) => {
    const deviation = item[category.deviationKey] || 0;
    const currentValue = item[category.key] || 0;
    const maxValue = Math.max(...data.map(d => d[category.key] || 0));
    const minValue = Math.min(...data.map(d => d[category.key] || 0));
    const avgValue = data.reduce((sum, d) => sum + (d[category.key] || 0), 0) / data.length;
    
    const status = getStatus(deviation);
    const performance = getPerformanceTrend(currentValue, maxValue);
    
    // Calculate percentile rank
    const sortedValues = [...data.map(d => d[category.key] || 0)].sort((a, b) => b - a);
    const rank = sortedValues.findIndex(val => val <= currentValue) + 1;
    const percentile = ((data.length - rank + 1) / data.length * 100).toFixed(0);

    setActiveCell(`${item.ID}-${category.key}`);
    setTooltipVisible(true);
    
    setTooltipContent(`
      <div class="smart-tooltip-header">
        <div class="device-name">${item.Inverter_Name || `Device ${item.ID}`}</div>
        <div class="category-badge">${category.label}</div>
      </div>
      
      <div class="smart-tooltip-metrics">
        <div class="metric-row primary">
          <span class="metric-label">Current Value:</span>
          <span class="metric-value">${Number(currentValue).toFixed(2)} ${category.unit}</span>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">Deviation:</span>
          <span class="metric-value deviation ${status.class}">${status.emoji} ${deviation.toFixed(1)}% (${status.text})</span>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">Performance:</span>
          <span class="metric-value performance ${performance.class}">${performance.emoji} ${performance.text}</span>
        </div>
        
        <div class="metric-row">
          <span class="metric-label">Percentile Rank:</span>
          <span class="metric-value">${percentile}th percentile</span>
        </div>
      </div>
      
      <div class="smart-tooltip-comparison">
        <div class="comparison-row">
          <span class="comp-label">vs. Best:</span>
          <span class="comp-value">${Number(maxValue).toFixed(2)} ${category.unit}</span>
        </div>
        <div class="comparison-row">
          <span class="comp-label">vs. Average:</span>
          <span class="comp-value">${Number(avgValue).toFixed(2)} ${category.unit}</span>
        </div>
        <div class="comparison-row">
          <span class="comp-label">vs. Worst:</span>
          <span class="comp-value">${Number(minValue).toFixed(2)} ${category.unit}</span>
        </div>
      </div>
    `);

    // Smart positioning with delay
    setTimeout(() => {
      const cellRect = event.currentTarget.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      const position = smartTooltipPositioning(cellRect, tooltip);
      setTooltipStyle(position);
    }, 0);
  }, [data, smartTooltipPositioning]);

  const handleMouseOut = useCallback(() => {
    setTooltipVisible(false);
    setActiveCell(null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (tooltipVisible) {
        setTooltipVisible(false);
      }
    };

    const handleResize = () => {
      if (tooltipVisible) {
        setTooltipVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [tooltipVisible]);

  const getColor = (deviation) => {
    if (deviation >= 0 && deviation < 25) return "rgba(39, 174, 96, 0.8)";
    if (deviation >= 25 && deviation < 50) return "rgba(241, 196, 15, 0.8)";
    if (deviation >= 50 && deviation < 75) return "rgba(243, 156, 18, 0.8)";
    if (deviation >= 75) return "rgba(231, 76, 60, 0.8)";
    return "rgba(149, 165, 166, 0.8)";
  };

  const Legend = () => {
    const legendData = [
      { color: "rgba(39, 174, 96, 0.8)", label: "Excellent (0-25%)", emoji: "🟢" },
      { color: "rgba(241, 196, 15, 0.8)", label: "Good (25-50%)", emoji: "🟡" },
      { color: "rgba(243, 156, 18, 0.8)", label: "Warning (50-75%)", emoji: "🟠" },
      { color: "rgba(231, 76, 60, 0.8)", label: "Critical (75%+)", emoji: "🔴" },
    ];

    return (
      <div className="modern-legend">
        <div className="legend-title">
          <span className="legend-icon">📊</span>
          Performance Deviation
        </div>
        <div className="legend-items">
          {legendData.map((item, index) => (
            <div key={index} className="modern-legend-item">
              <div
                className="legend-indicator"
                style={{ backgroundColor: item.color }}
              >
                {item.emoji}
              </div>
              <span className="legend-text">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="modern-heatmap-container" ref={containerRef}>
      <div className="heatmap-legend-section">
        <Legend />
      </div>
      
      <div className="modern-heatmap-grid">
        {heatmapCategories.map((category, categoryIndex) => (
          <div key={category.key} className="heatmap-category-row">
            <div className="category-header">
              <div className="category-title">{category.label}</div>
              <div className="category-unit">{category.unit}</div>
            </div>
            
            <div className="heatmap-cells-container">
              {data.map((item, itemIndex) => (
                <div
                  key={`${item.ID}-${category.key}`}
                  className={`modern-heatmap-cell ${activeCell === `${item.ID}-${category.key}` ? 'active' : ''}`}
                  style={{ 
                    backgroundColor: getColor(item[category.deviationKey] || 0),
                    animationDelay: `${(categoryIndex * data.length + itemIndex) * 50}ms`
                  }}
                  onMouseOver={(e) => handleMouseOver(e, item, category)}
                  onMouseOut={handleMouseOut}
                >
                  <div className="cell-value">
                    {Number(item[category.key] || 0).toFixed(1)}
                  </div>
                  <div className="cell-device">
                    {item.Inverter_Name?.split('_')[1] || `D${item.ID}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        ref={tooltipRef}
        className={`smart-tooltip ${tooltipVisible ? "visible" : ""}`}
        style={{
          left: tooltipStyle.left,
          top: tooltipStyle.top,
        }}
        dangerouslySetInnerHTML={{ __html: tooltipContent }}
      />
    </div>
  );
};

export default Heatmap;
