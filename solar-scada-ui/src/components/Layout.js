import React, { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton, Tooltip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faVolumeMute,
  faVolumeUp,
  faHome,
  faSolarPanel,
  faBolt,
  faWind,
  faPlug,
  faFileAlt,
  faSignOutAlt,
  faLineChart,
  faDiagramProject,
  faCamera,
  faPrint,
  faUser,
  faCalculator
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Howl } from "howler";
import html2canvas from "html2canvas";
import "./Layout.css";
import logo from "../assets/logo.png";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarState");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [activePath, setActivePath] = useState(window.location.pathname);
  const [lastVisitedPath, setLastVisitedPath] = useState("/dashboard");
  const [dateTime, setDateTime] = useState(formatDateTime(new Date()));
  const [hasNewAlarm, setHasNewAlarm] = useState(false);
  const [isMuted, setIsMuted] = useState(() => JSON.parse(localStorage.getItem("alarmMuted")) || false);
  const [sound, setSound] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeAlarmCount, setActiveAlarmCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(formatDateTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const alarmSound = new Howl({
      src: ["/alarm.wav"],
      format: ["wav"],
      loop: true,
      volume: 1.0,
      preload: true,
    });
    setSound(alarmSound);
  }, []);

  useEffect(() => {
    const checkForAlarms = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/alarm");
        const activeAlarms = response.data.filter((alarm) => alarm.status === "ON");
        setActiveAlarmCount(activeAlarms.length);

        if (activeAlarms.length > 0) {
          setHasNewAlarm(true);
          if (!isMuted) sound?.play();
        } else {
          setHasNewAlarm(false);
          sound?.stop();
        }
      } catch (error) {
        console.error("Error fetching alarms:", error);
      }
    };

    const alarmInterval = setInterval(checkForAlarms, 5000);
    return () => clearInterval(alarmInterval);
  }, [isMuted, sound]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("sidebarState", JSON.stringify(newState));
  };

  const toggleMute = () => {
    setIsMuted((prevMuted) => {
      const newMuted = !prevMuted;
      localStorage.setItem("alarmMuted", JSON.stringify(newMuted));

      if (newMuted) {
        sound?.stop();
      } else {
        axios.get("http://localhost:5000/api/alarm")
          .then((response) => {
            if (response.data.some((alarm) => alarm.status === "ON")) {
              sound?.play();
            }
          })
          .catch((error) => console.error("Error checking alarms:", error));
      }
      return newMuted;
    });
  };

  function formatDateTime(date) {
    let day = date.getDate();
    let suffix = getOrdinalSuffix(day);
    let formattedDay = `${day}${suffix}`;
    let formattedDate = date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    let formattedTime = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });

    return `${formattedDay} ${formattedDate} | ${formattedTime} |`;
  }

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }

  const [user, setUser] = useState(() => localStorage.getItem("username") || "Guest");

  const navItems = [
    { path: "/dashboard", icon: faHome, text: "Dashboard" },
    { path: "/SLDTemplate", icon: faDiagramProject, text: "SLD" },
    { path: "/inverter", icon: faSolarPanel, text: "Inverter" },
    { path: "/heatmap", icon: faDiagramProject, text: "Heatmap" },
    { path: "/mfm", icon: faBolt, text: "MFM" },
    { path: "/wms", icon: faWind, text: "WMS" },
    { path: "/TransformerScreen", icon: faPlug, text: "Transformer" },
    { path: "/AlarmScreen", icon: faBell, text: "Alarm" },
    { path: "/CustomTrend", icon: faLineChart, text: "Custom Trend" },
    {
      path: "/report",
      icon: faFileAlt,
      text: "Report",
      isExternal: true,
      url: "http://localhost/ReportServer/Pages/ReportViewer.aspx?%2fJINDAL_21MW%2fIndex_Page&rs:Command=Render",
    },
    { path: "/formula", icon: faCalculator, text: "Formula" },
  ];

  const handleNavigation = (item) => {
    if (item.isExternal) {
      window.open(item.url, "_blank");
    } else {
      setLastVisitedPath(activePath);
      window.location.href = item.path;
      setActivePath(item.path);
    }
  };

  const toggleAlarmScreen = () => {
    if (activePath === "/AlarmScreen") {
      navigate(lastVisitedPath);
    } else {
      setLastVisitedPath(activePath);
      navigate("/AlarmScreen");
    }
    setActivePath((prev) => (prev === "/AlarmScreen" ? lastVisitedPath : "/AlarmScreen"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/";
  };

  const handlePrintScreen = () => {
    window.print();
  };

  const handleScreenshot = () => {
    html2canvas(document.body).then((canvas) => {
      const link = document.createElement("a");
      link.download = "screenshot.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const navigateToMap = () => {
    navigate("/leaflet-map");
  };

  return (
    <div className="layout-container">
      <header className="header">
        <div className="toolbar">
          <div className="header-left">
            <IconButton edge="start" className={`menu-button ${isSidebarOpen ? "active" : ""}`} onClick={toggleSidebar} color="inherit">
              <MenuIcon />
            </IconButton>
            <h1 className="project-name" onClick={navigateToMap} style={{ cursor: 'pointer' }}>SUN-SCADA</h1>
          </div>
          <div className="header-title">
            <h2>21.5MWp JSPL SOLAR PROJECT, DHULE, MAHARASHTRA</h2>
          </div>
          <div className="header-right">
            <FontAwesomeIcon icon={faCamera} className="print-screen-icon icon-large" onClick={handleScreenshot} />
            <FontAwesomeIcon icon={faPrint} className="print-page-icon icon-large" onClick={handlePrintScreen} />
            <div className="alarm-icon-container" onClick={toggleAlarmScreen}>
              <FontAwesomeIcon icon={faBell} className={`alarm-icon ${hasNewAlarm ? "blink" : ""}`} />
              {activeAlarmCount > 0 && (
                <span className="alarm-count">{activeAlarmCount}</span>
              )}
            </div>
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} className="mute-icon" onClick={toggleMute} />
            <span className="datetime">{dateTime}</span>
            <div className="user-icon-container" onClick={toggleUserMenu}>
              <FontAwesomeIcon icon={faUser} className="user-icon icon-large" />
              {showUserMenu && (
                <div className="user-menu">
                  <p>{user}</p>
                  <button onClick={handleLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                  </button>
                </div>
              )}
            </div>
            <img src={logo} alt="Company Logo" className="header-logo" />
          </div>
        </div>
      </header>
      <aside className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <nav className="menu">
          <ul>
            {navItems.map((item) => (
              <Tooltip title={!isSidebarOpen ? item.text : ""} placement="right" key={item.path}>
                <li className={activePath === item.path ? "active" : ""} onClick={() => handleNavigation(item)}>
                  <FontAwesomeIcon icon={item.icon} />
                  {isSidebarOpen && <span className="menu-text">{item.text}</span>}
                </li>
              </Tooltip>
            ))}
          </ul>
        </nav>
      </aside>
      <main className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>{children}</main>
    </div>
  );
};

export default Layout;
