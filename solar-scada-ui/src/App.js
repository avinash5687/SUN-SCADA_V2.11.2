import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from './pages/LandingPage';

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inverter from "./pages/Inverter";
import MFM from "./pages/MFM";
import WMS from "./pages/WMS";
import Alarm from "./pages/AlarmScreen";
import Report from "./pages/Report";
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



const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <Routes>

        {/* Redirect from root to landing page */}
        {/* <Route path="/" element={<StartupScreen />} />
        <Route path="/startup" element={<StartupScreen />} /> */}
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

        {/* Protected Routes */}
        <Route
          path="/leaflet-map"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <LeafletMap />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/InverterScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <Inverter />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/MfmScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <MFM />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/WmsScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <WMS />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/AlarmScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <Alarm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/report"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <Report />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/CustomTrend"
          element={
            <PrivateRoute>
              <CustomTrend />
            </PrivateRoute>
          }
        />
        <Route
          path="/SLDTemplate"
          element={
            <PrivateRoute>
              <SLDScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/InverterHeatmap"
          element={
            <PrivateRoute>
              <Layout>
                <HeatmapScreen />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/FormulaScreen"
          element={
            <PrivateRoute>
              <FormulaScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/TransformerScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <TransformerScreen />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/SmbScreen"
          element={
            <PrivateRoute>
              <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                <SmbScreen />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/SmbHeatmap"
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
