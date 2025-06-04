import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fetchDashboardData = () => api.get("/dashboard");
export const fetchInverterData = () => api.get("/inverter");
export const fetchMFMData = () => api.get("/mfm");
export const fetchWMSData = () => api.get("/wms");
export const fetchAlarmData = () => api.get("/Alarm");
export const fetchReportData = () => api.get("/report");
export const fetchTrendData = () => api.get("/customtrend");

export const fetchPlantKPI = () => api.get("/dashboard/plant-kpi");

export default api;
