import React, { useState, useEffect } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton } from "@mui/material";
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
  faDiagramProject, // New icon for SLD
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Howl } from "howler";
import "./Layout.css";
import logo from "../assets/logo.png";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("sidebarState");
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [activePath, setActivePath] = useState(window.location.pathname);
  const [lastVisitedPath, setLastVisitedPath] = useState("/dashboard"); // ✅ Store last visited page
  const [dateTime, setDateTime] = useState(formatDateTime(new Date()));
  const [hasNewAlarm, setHasNewAlarm] = useState(false);
  const [isMuted, setIsMuted] = useState(() => JSON.parse(localStorage.getItem("alarmMuted")) || false);
  const [sound, setSound] = useState(null);
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
        const activeAlarms = response.data.some((alarm) => alarm.status === "ON");

        if (activeAlarms) {
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
        axios
          .get("http://localhost:5000/api/alarm")
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
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const [user, setUser] = useState(() => localStorage.getItem("username") || "Guest");

  const navItems = [
    { path: "/dashboard", icon: faHome, text: "Dashboard" },
    { path: "/inverter", icon: faSolarPanel, text: "Inverter" },
    { path: "/mfm", icon: faBolt, text: "MFM" },
    { path: "/wms", icon: faWind, text: "WMS" },
    { path: "/AlarmScreen", icon: faBell, text: "Alarm" },
    { path: "/transformer", icon: faPlug, text: "Transformer" },
    { path: "/CustomTrend", icon: faLineChart, text: "Custom Trend" },
    { path: "/sld", icon: faDiagramProject, text: "SLD" }, // ✅ Added SLD item
    {
      path: "report",
      icon: faFileAlt,
      text: "Report",
      isExternal: true,
      url: "http://desktop-gljei74/ReportServer/Pages/ReportViewer.aspx?%2f10MW_SOLAR%2fReport1&rs:Command=Render",
    },
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

  // ✅ Toggle Alarm Screen
  const toggleAlarmScreen = () => {
    if (activePath === "/AlarmScreen") {
      navigate(lastVisitedPath); // Go back to last visited screen
    } else {
      setLastVisitedPath(activePath); // Save current page before switching
      navigate("/AlarmScreen");
    }
    setActivePath((prev) => (prev === "/AlarmScreen" ? lastVisitedPath : "/AlarmScreen"));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="layout-container">
      <header className="header">
        <div className="toolbar">
          <div className="header-left">
            <IconButton edge="start" className={`menu-button ${isSidebarOpen ? "active" : ""}`} onClick={toggleSidebar} color="inherit">
              <MenuIcon />
            </IconButton>
            <h1 className="project-name">SUN-SCADA</h1>
          </div>
          <div className="header-title">
            <h2>16MW Solar Power Plant - Tamil Nadu</h2>
          </div>
          <div className="header-right">
            <FontAwesomeIcon
              icon={faBell}
              className={`alarm-icon ${hasNewAlarm ? "shake" : ""}`}
              onClick={toggleAlarmScreen} // ✅ Toggle Alarm Screen
            />
            <FontAwesomeIcon icon={isMuted ? faVolumeMute : faVolumeUp} className="mute-icon" onClick={toggleMute} />
            <span className="datetime">{dateTime}</span>
            <span className="user-info">User :- {user}</span>
            <img src={logo} alt="Company Logo" className="header-logo" />
          </div>
        </div>
      </header>
      <aside className={`sidebar ${isSidebarOpen ? "open" : "collapsed"}`}>
        <nav className="menu">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className={activePath === item.path ? "active" : ""} onClick={() => handleNavigation(item)}>
                <FontAwesomeIcon icon={item.icon} />
                <span className="menu-text">{item.text}</span>
              </li>
            ))}
          </ul>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> <span>Logout</span>
        </button>
      </aside>
      <main className={`main-content ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>{children}</main>
    </div>
  );
};

export default Layout;