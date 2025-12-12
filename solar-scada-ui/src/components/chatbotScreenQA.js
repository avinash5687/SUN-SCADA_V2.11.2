/**
 * Centralized screen-based Q&A configuration.
 * Each entry has: id, text, icon, answer
 */

export const SCREEN_QA = {
  Dashboard: [
    {
      id: 'dash_low_pr',
      text: 'Why is PR low?',
      icon: '📊',
      answer:
        `Low Plant Performance Ratio causes:\n\nPrimary Factors:\n• Soiling/dust accumulation (2–5% loss)\n• Shading from structures/vegetation\n• Module degradation or hot spots\n• Inverter clipping during peak hours\n\nSecondary Factors:\n• Cable losses from poor connections\n• Grid voltage fluctuations\n• High ambient temperatures\n• Component aging\n\nAction Items:\n1) Check soiling levels and clean if >3% loss\n2) Review monitoring data for patterns\n3) Inspect for shading issues\n4) Verify inverter performance curves`
    },
    {
      id: 'dash_alerts',
      text: 'What do today’s alerts mean?',
      icon: '⚠️',
      answer:
        `Alert interpretation tips:\n• Open inverter faults: halt or reduce production\n• Grid voltage/frequency: site/grid side issue\n• Communication loss: check network/RS485/4G\n\nNext steps:\n1) Open each alert to see source + timestamp\n2) Correlate with power dip on trends\n3) Acknowledge resolved alerts to declutter`
    }
  ],

  Inverter: [
    {
      id: 'inv_perf',
      text: 'Why is inverter performing low?',
      icon: '🔌',
      answer:
        `Common issues:\n• Over temperature conditions\n• Grid voltage/frequency variations\n• DC input voltage fluctuations\n• Component degradation over time\n\nDiagnostics:\n1) Check inverter temperature and ventilation\n2) Verify DC input voltage levels\n3) Monitor AC output quality\n4) Review error logs and fault codes\n5) Compare with manufacturer specs\n\nImmediate actions:\n• Ensure proper cooling\n• Check for loose DC connections\n• Verify grid parameters\n• Contact manufacturer if persistent`
    },
    {
      id: 'inv_temp',
      text: 'What if inverter temperature is high?',
      icon: '🌡️',
      answer:
        `High temperature mitigation:\n• Clear air filters/vents\n• Improve airflow; check fan operation\n• Reduce ambient heat sources\n• Consider derating during peak heat\n\nCheck logs for thermal derate/clipping`
    }
  ],

  MFMScreen: [
    {
      id: 'mfm_comm',
      text: 'MFM not communicating?',
      icon: '📟',
      answer:
        `Common causes:\n• RS485 wiring issues\n• Meter power off\n• Address conflict\n\nChecks:\n1) Verify supply (24V/230V)\n2) Confirm Modbus address & baud rate\n3) Check A/B polarity and termination\n4) Try querying via gateway if supported\n\nActions:\n• Reseat terminals\n• Correct address/baud\n• Replace faulty converter`
    },
    {
      id: 'mfm_accuracy',
      text: 'MFM readings accuracy?',
      icon: '✅',
      answer:
        `Accuracy guidelines:\n• Class 0.5S or 1.0 typical\n• Compare with inverter AC meter\n• Deviation >1.5–2% warrants calibration\n\nBest practices:\n• Annual calibration\n• Tighten terminals to avoid heating\n• Use shielded twisted pair for RS485`
    },
    {
      id: 'mfm_ct',
      text: 'CT polarity and ratio issues?',
      icon: '🧭',
      answer:
        `Symptoms:\n• Negative power\n• Half/over-reported kW\n\nChecks:\n1) CT orientation (P1→source)\n2) CT ratio configured matches installed\n3) Phase-CT alignment (A/B/C)\n\nActions:\n• Swap leads if reversed\n• Correct ratio in meter params\n• Realign phases`
    }
  ],

  Default: [
    {
      id: 'low_pr',
      text: 'Why is PR low?',
      icon: '📊',
      answer:
        `Low Plant Performance Ratio causes:\n\nPrimary Factors:\n• Soiling/dust accumulation (2–5% loss)\n• Shading from structures/vegetation\n• Module degradation or hot spots\n• Inverter clipping during peak hours\n\nSecondary Factors:\n• Cable losses from poor connections\n• Grid voltage fluctuations\n• High ambient temperatures\n• Component aging\n\nAction Items:\n1) Check soiling levels and clean if >3% loss\n2) Review monitoring data for patterns\n3) Inspect for shading issues\n4) Verify inverter performance curves`
    },
    {
      id: 'inverter_performance',
      text: 'Why is inverter performing low?',
      icon: '🔌',
      answer:
        `Common issues:\n• Over temperature conditions\n• Grid voltage/frequency variations\n• DC input voltage fluctuations\n• Component degradation over time\n\nDiagnostics:\n1) Check inverter temperature and ventilation\n2) Verify DC input voltage levels\n3) Monitor AC output quality\n4) Review error logs and fault codes\n5) Compare with manufacturer specs\n\nImmediate actions:\n• Ensure proper cooling\n• Check for loose DC connections\n• Verify grid parameters\n• Contact manufacturer if persistent`
    },
    {
      id: 'module_cleaning',
      text: 'When to clean modules?',
      icon: '🧽',
      answer:
        `Frequency:\n• Dusty areas: 2–4 weeks\n• Normal: 6–8 weeks\n• After dust storms: Immediately\n• When power loss >3%\n\nBest practices:\n1) Early morning\n2) DI water + soft brushes\n3) Top → bottom\n4) Avoid walking on modules\n5) Inspect for damage\n\nQC:\n• Verify power improvement\n• Document before/after`
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