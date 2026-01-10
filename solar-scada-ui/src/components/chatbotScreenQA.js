/**
 * Centralized screen-based Q&A configuration.
 * Each entry has: id, text, icon, answer
 */

export const SCREEN_QA = {
  Dashboard: [
    {
      id: 'dash_low_pr',
      text: 'Why is PR low?',
      icon: 'TrendingDownIcon',
      answer:
        `Low Plant Performance Ratio causes:\n\nPrimary Factors:\n• Soiling/dust accumulation (2–5% loss)\n• Shading from structures/vegetation\n• Module degradation or hot spots\n• Inverter clipping during peak hours\n\nSecondary Factors:\n• Cable losses from poor connections\n• Grid voltage fluctuations\n• High ambient temperatures\n• Component aging\n\nAction Items:\n1) Check soiling levels and clean if >3% loss\n2) Review monitoring data for patterns\n3) Inspect for shading issues\n4) Verify inverter performance curves`
    },
    {
      id: 'dash_alerts',
      text: 'What do today’s alerts mean?',
      icon: 'WarningIcon',
      answer:
        `Alert interpretation tips:\n• Open inverter faults: halt or reduce production\n• Grid voltage/frequency: site/grid side issue\n• Communication loss: check network/RS485/4G\n\nNext steps:\n1) Open each alert to see source + timestamp\n2) Correlate with power dip on trends\n3) Acknowledge resolved alerts to declutter`    },
    {
      id: 'dash_today_energy',
      text: 'How much energy today?',
      icon: 'BatteryChargingFullIcon',
      answer:
        `Today's energy summary:\n• View the hourly generation bar chart\n• Peak typically 11 AM – 3 PM\n• Compare with weather conditions\n• Check forecast alignment\n\nFactors affecting output:\n• Cloud cover reduces generation\n• Temperature: higher temp = lower efficiency\n• Wind speed: affects module cooling\n• Compare with historical data patterns`
    },
    {
      id: 'dash_performance_trend',
      text: 'What is the performance trend?',
      icon: 'ShowChartIcon',
      answer:
        `Performance trend analysis:\n• Check multi-line chart on dashboard\n• Identify seasonal patterns\n• Monthly/yearly comparison shows degradation\n• Typical: 0.5–0.8% annual degradation\n\nRed flags:\n• Sudden drops = fault/failure event\n• Gradual decline = soiling/component aging\n• Flat periods = equipment downtime\n\nActions:\n• Clean modules if soiling detected\n• Review maintenance logs\n• Schedule preventive component checks`    }
  ],

  Inverter: [
    {
      id: 'inv_perf',
      text: 'Why is inverter performing low?',
      icon: 'ElectricalServicesIcon',
      answer:
        `Common issues:\n• Over temperature conditions\n• Grid voltage/frequency variations\n• DC input voltage fluctuations\n• Component degradation over time\n\nDiagnostics:\n1) Check inverter temperature and ventilation\n2) Verify DC input voltage levels\n3) Monitor AC output quality\n4) Review error logs and fault codes\n5) Compare with manufacturer specs\n\nImmediate actions:\n• Ensure proper cooling\n• Check for loose DC connections\n• Verify grid parameters\n• Contact manufacturer if persistent`
    },
    {
      id: 'inv_temp',
      text: 'What if inverter temperature is high?',
      icon: 'ThermostatIcon',
      answer:
        `High temperature mitigation:\n• Clear air filters/vents\n• Improve airflow; check fan operation\n• Reduce ambient heat sources\n• Consider derating during peak heat\n\nCheck logs for thermal derate/clipping`
    },
    {
      id: 'inv_efficiency',
      text: 'How to improve efficiency?',
      icon: 'TrendingUpIcon',
      answer:
        `Efficiency improvement tips:\n• Optimal DC voltage range: refer to spec sheet\n• Minimize string voltage mismatch\n• Ensure proper DC string balancing\n• Regular firmware updates\n• Maintain optimal operating temperature\n\nMonitoring:\n• Track daily efficiency curves\n• Compare with STC rating\n• Typical efficiency: 96–98%\n• Losses: clipping, thermal, conversion`
    },
    {
      id: 'inv_grid_faults',
      text: 'What are grid-related faults?',
      icon: 'SignalCellularAltIcon',
      answer:
        `Common grid faults:\n• Over/under voltage (80–110% nominal)\n• Over/under frequency (±0.5 Hz typical)\n• Grid disconnect/islanding\n• Harmonic distortion\n\nInverter response:\n• Auto-trip if limits exceeded\n• Anti-islanding protection activates\n• Waits for grid stabilization before restart\n\nChecks:\n• Verify grid voltage and frequency\n• Inspect utility connection\n• Check surge protection devices\n• Contact utility if persistent`
    }
  ],

  MFMScreen: [
    {
      id: 'mfm_comm',
      text: 'MFM not communicating?',
      icon: 'SignalCellularNullIcon',
      answer:
        `Common causes:\n• RS485 wiring issues\n• Meter power off\n• Address conflict\n\nChecks:\n1) Verify supply (24V/230V)\n2) Confirm Modbus address & baud rate\n3) Check A/B polarity and termination\n4) Try querying via gateway if supported\n\nActions:\n• Reseat terminals\n• Correct address/baud\n• Replace faulty converter`
    },
    {
      id: 'mfm_accuracy',
      text: 'MFM readings accuracy?',
      icon: 'CheckCircleIcon',
      answer:
        `Accuracy guidelines:\n• Class 0.5S or 1.0 typical\n• Compare with inverter AC meter\n• Deviation >1.5–2% warrants calibration\n\nBest practices:\n• Annual calibration\n• Tighten terminals to avoid heating\n• Use shielded twisted pair for RS485`
    },
    {
      id: 'mfm_ct',
      text: 'CT polarity and ratio issues?',
      icon: 'CompareArrowsIcon',
      answer:
        `Symptoms:\n• Negative power\n• Half/over-reported kW\n\nChecks:\n1) CT orientation (P1→source)\n2) CT ratio configured matches installed\n3) Phase-CT alignment (A/B/C)\n\nActions:\n• Swap leads if reversed\n• Correct ratio in meter params\n• Realign phases`
    },
    {
      id: 'mfm_power_factor',
      text: 'How to improve power factor?',
      icon: 'RadarIcon',
      answer:
        `Power factor basics:\n• Ideal: 1.0 (unity)\n• <0.95 may incur penalties\n• Inductive load: capacitor banks help\n\nMeasurement:\n• Check MFM reactive power (kVAR)\n• Compare with active power (kW)\n• Monthly trending shows patterns\n\nImprovements:\n• Verify equipment grounding\n• Balance load across phases\n• Install power factor correction if needed`
    }
  ],

  SMB: [
    {
      id: 'smb_health',
      text: 'What is SMB health status?',
      icon: 'MonitorHeartIcon',
      answer:
        `SMB Health indicators:\n• Green (Good): All parameters normal\n• Yellow (Warning): Minor issues detected\n• Red (Critical): Urgent attention needed\n\nCheck:\n1) DC voltage levels (typical: 400–800V DC)\n2) AC output voltage (preferred: 415V ±10%)\n3) Component temperatures (<80°C ideal)\n4) Current balance across phases\n5) Harmonic distortion (<5% THD)\n\nActions if not healthy:\n• Check input/output connections\n• Verify cooling fans operating\n• Review recent error logs\n• Contact support if issues persist`
    },
    {
      id: 'smb_communication',
      text: 'SMB not communicating?',
      icon: 'SignalCellularNullIcon',
      answer:
        `Troubleshooting steps:\n1) Check physical connections\n   - Verify RS485/Modbus cable\n   - Inspect for loose connectors\n   - Look for damaged wiring\n\n2) Power verification\n   - Ensure SMB has 24V supply\n   - Check power supply LED\n\n3) Network settings\n   - Confirm correct Modbus address\n   - Verify baud rate (typically 9600)\n   - Check A/B terminal polarity\n\n4) Gateway check\n   - Verify gateway is online\n   - Check network connectivity\n   - Restart if needed\n\nIf unresolved: Contact manufacturer`
    },
    {
      id: 'smb_temperature',
      text: 'SMB temperature too high?',
      icon: 'ThermostatIcon',
      answer:
        `Temperature management:\n• Ideal range: 15–35°C ambient\n• Maximum: 50°C before derating\n• Over 60°C: Auto-shutdown activates\n\nMitigation steps:\n1) Check ventilation around SMB\n2) Ensure cooling fans are running\n3) Verify ambient temperature\n4) Clean intake filters\n5) Increase air circulation\n6) Check for blocked vents\n\nMonitoring:\n• Track daily max temperatures\n• Compare with season/weather\n• Log cooling fan runtime\n• Replace fans if not spinning\n\nNote: High temps reduce efficiency`
    },
    {
      id: 'smb_efficiency',
      text: 'How to maximize SMB efficiency?',
      icon: 'TrendingUpIcon',
      answer:
        `Efficiency optimization:\n• Optimal DC voltage: per specification sheet\n• Minimize cable losses: use recommended gauge\n• Balance string currents: ±5% variance acceptable\n• Regular firmware updates: check quarterly\n\nOperating conditions:\n• Ambient temp: 25°C = peak efficiency\n• High temp derate: ~0.5% per °C above 25°C\n• Maintain DC input voltage stability\n• Minimize reactive power\n\nMonitoring metrics:\n• Track daily efficiency curves\n• Compare with STC (Standard Test Conditions)\n• Typical efficiency: 96–98.5%\n• Monitor thermal stability\n\nMaintenance:\n• Annual efficiency audit\n• Clean intake vents\n• Check all connections`
    },
    {
      id: 'smb_faults',
      text: 'Common SMB faults and errors?',
      icon: 'BugReportIcon',
      answer:
        `Common fault codes:\n\nE001 - Input Overvoltage\n• Check DC voltage (max 900V)\n• Verify string configuration\n• Check for back-feed\n\nE002 - Input Undervoltage\n• Verify minimum DC (400V typical)\n• Check string connections\n• Ensure no partial shading\n\nE003 - Ground Fault\n• Check equipment grounding\n• Verify insulation integrity\n• Contact qualified electrician\n\nE004 - Phase Failure\n• Verify AC supply (3-phase)\n• Check utility connection\n• Verify circuit breakers\n\nE005 - Communication Error\n• Check Modbus connections\n• Verify gateway online\n• Restart communication module\n\nAction: Log error code + timestamp → Document pattern → Contact support if recurring`
    }
  ],

  Default: [
    {
      id: 'low_pr',
      text: 'Why is PR low?',
      icon: 'TrendingDownIcon',
      answer:
        `Low Plant Performance Ratio causes:\n\nPrimary Factors:\n• Soiling/dust accumulation (2–5% loss)\n• Shading from structures/vegetation\n• Module degradation or hot spots\n• Inverter clipping during peak hours\n\nSecondary Factors:\n• Cable losses from poor connections\n• Grid voltage fluctuations\n• High ambient temperatures\n• Component aging\n\nAction Items:\n1) Check soiling levels and clean if >3% loss\n2) Review monitoring data for patterns\n3) Inspect for shading issues\n4) Verify inverter performance curves`
    },
    {
      id: 'inverter_performance',
      text: 'Why is inverter performing low?',
      icon: 'ElectricalServicesIcon',
      answer:
        `Common issues:\n• Over temperature conditions\n• Grid voltage/frequency variations\n• DC input voltage fluctuations\n• Component degradation over time\n\nDiagnostics:\n1) Check inverter temperature and ventilation\n2) Verify DC input voltage levels\n3) Monitor AC output quality\n4) Review error logs and fault codes\n5) Compare with manufacturer specs\n\nImmediate actions:\n• Ensure proper cooling\n• Check for loose DC connections\n• Verify grid parameters\n• Contact manufacturer if persistent`
    },
    {
      id: 'module_cleaning',
      text: 'When to clean modules?',
      icon: 'CleaningServicesIcon',
      answer:
        `Frequency:\n• Dusty areas: 2–4 weeks\n• Normal: 6–8 weeks\n• After dust storms: Immediately\n• When power loss >3%\n\nBest practices:\n1) Early morning\n2) DI water + soft brushes\n3) Top → bottom\n4) Avoid walking on modules\n5) Inspect for damage\n\nQC:\n• Verify power improvement\n• Document before/after`
    },
    {
      id: 'system_monitoring',
      text: 'How to monitor system health?',
      icon: 'MonitorHeartIcon',
      answer:
        `Key metrics to track:\n• Daily energy generation (kWh)\n• Performance Ratio (PR %)\n• Inverter efficiency\n• Module temperature\n• Grid voltage and frequency\n\nFrequency:\n• Real-time: minute-by-minute monitoring\n• Daily: summary reports\n• Weekly: performance trends\n• Monthly: degradation analysis\n\nActions:\n• Set alerts for anomalies\n• Compare with baseline\n• Document maintenance\n• Review weather correlation`
    },
    {
      id: 'maintenance_schedule',
      text: 'What\'s the maintenance schedule?',
      icon: 'ConstructionIcon',
      answer:
        `Recommended maintenance:\n\nMonthly:\n• Visual inspection\n• Check inverter display\n• Verify all lights/indicators\n\nQuarterly:\n• Module cleaning (if needed)\n• Check physical connections\n• Verify grounding\n\nAnnually:\n• Professional thermography\n• MFM calibration\n• Inverter service check\n• Electrical safety test\n\nAs Needed:\n• Component replacement\n• Firmware updates\n• Performance testing`
    },
    {
      id: 'troubleshooting',
      text: 'How to troubleshoot faults?',
      icon: 'BugReportIcon',
      answer:
        `Troubleshooting steps:\n1) Check Alert History\n   - Note timestamp and code\n\n2) Verify Hardware\n   - Inverter status lights\n   - Meter communications\n   - DC and AC voltages\n\n3) Review Data\n   - Compare with previous day\n   - Check weather conditions\n   - Look for patterns\n\n4) Isolate Issue\n   - Test components individually\n   - Check connections\n   - Verify settings\n\n5) Document\n   - Take photos/screenshots\n   - Record readings\n   - Note corrective actions\n\nContact support if needed`
    }
  ]
};

// Helper to retrieve options for a given screen, falling back to Default.
export const getScreenOptions = (screen) => {
  return SCREEN_QA[screen] || SCREEN_QA.Default;
};

// Optional: merge Default into screen-specific (if you want base + screen items)
export const getMergedScreenOptions = (screen) => {
  const specific = SCREEN_QA[screen] || [];
  const base = SCREEN_QA.Default || [];
  return [...specific, ...base];
};