import axios from "axios";

/**
 * Centralized API endpoint configuration.
 * Using relative paths, which works for both development (with proxy) and production.
 */
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: "/api/auth/login",
  },

  // Dashboard
  dashboard: {
    plantKpi: "/api/dashboard/plant-kpi",
    lineChart: "/api/dashboard/line-chart",
    wmsData: "/api/dashboard/WMSDATA-DASH",
    deviceStatus: "/api/dashboard/device-status",
    barChart: "/api/dashboard/bar-chart", // Day
    barChartWeek: "/api/dashboard/bar-chart1", // Week
    barChartMonth: "/api/dashboard/bar-chart2", // Month
    barChartYear: "/api/dashboard/bar-chart3", // Year
  },

  // Energy Data (from Login page)
  data: {
    energyData: "/api/data/energy-data",
  },

  // Inverter
  inverter: {
    getAll: "/api/inverter",
    heatmap: "/api/inverter/Heatmap",
  },

  // MFM
  mfm: {
    getAll: "/api/mfm",
  },

  // WMS
  wms: {
    getAll: "/api/wms",
    chart: "/api/wms/WMS-CHART",
    soilChart: "/api/wms/SOIL-CHART",
  },

  // Alarms
  alarm: {
    getAll: "/api/alarm",
    acknowledge: (id) => `/api/alarm/ack/${id}`,
    acknowledgeAll: "/api/alarm/ack-all",
    clear: (id) => `/api/alarm/clear/${id}`,
  },

  // Custom Trend
  customTrend: {
    getTables: "/api/custom-trend/getTables",
    getColumns: (table) => `/api/custom-trend/getColumns/${table}`,
    getTableData: "/api/custom-trend/getTableData",
    exportCsv: "/api/custom-trend/exportCSV",
  },

  // Transformer
  transformer: {
    getAll: "/api/transformer",
  },

  // Report Server
  report: {
    local: "http://103.102.234.177/ReportServer/Pages/ReportViewer.aspx?%2fReport+Parts%2fIndex_Page&rs:Command=Render",
  }
};
