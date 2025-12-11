import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from './pages/LandingPage';

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inverter from "./pages/Inverter";
import MFM from "./pages/MFM";
import WMS from "./pages/WMS";
import Alarm from "./pages/AlarmScreen";
import Login from "./pages/Login";
import CustomTrend from "./pages/CustomTrend";
import SLDScreen from './components/SLDTemplate';
import HeatmapScreen from "./pages/HeatmapScreen";
import FormulaScreen from "./pages/FormulaScreen";
import TransformerScreen from "./pages/TransformerScreen";
import LeafletMap from "./pages/LeafletMap";
import PrivateRoute from "./components/PrivateRoute"; // <-- Import here
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import StartupScreen from "./pages/StartupScreen";
import SmbScreen from "./pages/SmbScreen";
import SmbHeatmap from "./pages/SmbHeatmap";
import ReportPage from "./pages/ReportPage";


const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <Routes>
        <Route path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Login" element={<Login />} />
        <Route path="/" element={<Navigate to="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Login" replace />} />

        {/* Protected Routes */}
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Leaflet-Map"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <LeafletMap />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Dashboard"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/InverterScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <Inverter />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/MfmScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <MFM />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/WmsScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <WMS />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/AlarmScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <Alarm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/ReportPage"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <ReportPage />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/CustomTrend"
          element={
            <PrivateRoute>
              <CustomTrend />
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/SLDTemplate"
          element={
            <PrivateRoute>
              <SLDScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/InverterHeatmap"
          element={
            <PrivateRoute>
              <Layout>
                <HeatmapScreen />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/FormulaScreen"
          element={
            <PrivateRoute>
              <FormulaScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/TransformerScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <TransformerScreen />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/SmbScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <SmbScreen />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/SmbHeatmap"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <SmbHeatmap />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
