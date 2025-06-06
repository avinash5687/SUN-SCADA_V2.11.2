import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route
          path="/leaflet-map"
          element={
            <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <LeafletMap />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/inverter"
          element={
            <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <Inverter />
            </Layout>
          }
        />
        <Route
          path="/mfm"
          element={
            <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <MFM />
            </Layout>
          }
        />
        <Route
          path="/wms"
          element={
            <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <WMS />
            </Layout>
          }
        />
        <Route
          path="/AlarmScreen"
          element={
            <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <Alarm />
            </Layout>
          }
        />
        <Route
          path="/report"
          element={
            <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <Report />
            </Layout>
          }
        />        
        <Route path="/CustomTrend" element={<CustomTrend />} />
        <Route path="/SLDTemplate" element={<SLDScreen />} />
        <Route path="/heatmap" element={<Layout><HeatmapScreen /></Layout>} />
        <Route path="/formula" element={<FormulaScreen />} />
        <Route
          path="/TransformerScreen"
          element={
            <Layout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
              <TransformerScreen />
            </Layout>
          }
        /> 
      </Routes>
    </Router>
  );
};

export default App;
