import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  IconButton,
  Tooltip,
  Avatar,
  Badge,
  Chip,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Typography,
  Box,
  Divider
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon
} from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell, faVolumeMute, faVolumeUp, faHome, faSolarPanel,
  faBolt, faWind, faPlug, faFileAlt, faSignOutAlt,
  faLineChart, faDiagramProject, faCamera, faPrint,
  faUser, faCalculator, faCircle
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Howl } from "howler";
import html2canvas from "html2canvas";
import "./Layout.css";
import logo from "../assets/logo.png";
import { API_ENDPOINTS } from "../apiConfig";

// Utility functions
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

const formatDateTime = (date) => {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const formattedDay = `${day}${suffix}`;
  const formattedDate = date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric"
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  return `${formattedDay} ${formattedDate} | ${formattedTime}`;
};

// Custom hooks (same as before)
const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const savedValue = localStorage.getItem(key);
      return savedValue !== null ? JSON.parse(savedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

const useDateTime = (interval = 1000) => {
  const [dateTime, setDateTime] = useState(formatDateTime(new Date()));

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setDateTime(formatDateTime(new Date()));
    }, interval);
    return () => clearInterval(updateInterval);
  }, [interval]);

  return dateTime;
};

const useAlarms = (interval) => {
  const [alarms, setAlarms] = useState([]);
  const [activeAlarmCount, setActiveAlarmCount] = useState(0);
  const [hasNewAlarm, setHasNewAlarm] = useState(false);

  useEffect(() => {
    const checkForAlarms = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.alarm.getAll);
        const activeUnacknowledgedAlarms = response.data.filter(
          (alarm) => alarm.status === "ON" && !alarm.acknowledged
        );

        setAlarms(response.data);
        setActiveAlarmCount(activeUnacknowledgedAlarms.length);
        setHasNewAlarm(activeUnacknowledgedAlarms.length > 0);
      } catch (error) {
        console.error("Error fetching alarms:", error);
      }
    };

    checkForAlarms();
    const alarmInterval = setInterval(checkForAlarms, interval);
    return () => clearInterval(alarmInterval);
  }, [interval]);

  return { alarms, activeAlarmCount, hasNewAlarm };
};

const useAudio = (src) => {
  const [sound, setSound] = useState(null);

  useEffect(() => {
    const audioSound = new Howl({
      src: [src],
      format: ["wav"],
      loop: true,
      volume: 1.0,
      preload: true,
    });

    setSound(audioSound);

    return () => {
      audioSound.unload();
    };
  }, [src]);

  const playAlarm = useCallback(() => {
    sound?.play();
  }, [sound]);

  const stopAlarm = useCallback(() => {
    sound?.stop();
  }, [sound]);

  return { sound, playAlarm, stopAlarm };
};

// Modern Sub-components with updated designs
const ModernAlarmIndicator = ({ hasNewAlarm, activeAlarmCount, onClick }) => (
  <div className="modern-notification-container" onClick={onClick}>
    <Badge
      badgeContent={activeAlarmCount}
      color="error"
      variant={activeAlarmCount > 99 ? "standard" : "dot"}
      overlap="circular"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <div className={`modern-notification-icon ${hasNewAlarm ? "pulse-animation" : ""}`}>
        <FontAwesomeIcon
          icon={faBell}
          className="notification-bell"
        />
      </div>
    </Badge>
  </div>
);

const ModernUserMenu = ({ user, showMenu, onToggle, onLogout }) => {
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Administrator': return '#5777dd';
      case 'Operator': return '#4ecdc4';
      case 'Technician': return '#45b7d1';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="modern-user-menu-container">
      <div className="user-profile-trigger" onClick={onToggle}>
        <Avatar
          sx={{
            width: 24,
            height: 24,
            bgcolor: getRoleColor(user.role),
            fontSize: '0.65rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
        >
          {getInitials(user.username)}
        </Avatar>
        <ArrowDownIcon
          className={`user-menu-arrow ${showMenu ? 'rotated' : ''}`}
          sx={{ fontSize: 11, ml: 0.3, transition: 'transform 0.2s ease-in-out' }}
        />
      </div>

      <Fade in={showMenu} timeout={200}>
        <div className={`modern-user-menu ${showMenu ? 'visible' : ''}`}>
          <div className="user-menu-header">
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: getRoleColor(user.role),
                mb: 1
              }}
            >
              {getInitials(user.username)}
            </Avatar>
            <Typography variant="body2" fontWeight="600" fontSize="0.7rem">
              {user.username}
            </Typography>
            <Chip
              label={user.role}
              size="small"
              sx={{
                bgcolor: getRoleColor(user.role),
                color: 'white',
                fontSize: '0.55rem',
                height: 14
              }}
            />
          </div>
          <Divider sx={{ my: 1 }} />
          <button className="modern-logout-btn" onClick={onLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Sign Out</span>
          </button>
        </div>
      </Fade>
    </div>
  );
};

const ModernActionButton = ({ icon, tooltip, onClick, variant = "default", badge = null }) => (
  <Tooltip title={tooltip} placement="bottom" arrow>
    <div className={`modern-action-btn ${variant}`} onClick={onClick}>
      {badge ? (
        <Badge badgeContent={badge} color="error" variant="dot">
          <FontAwesomeIcon icon={icon} />
        </Badge>
      ) : (
        <FontAwesomeIcon icon={icon} />
      )}
    </div>
  </Tooltip>
);

// New Modern Toggle Button Component
const ModernToggleButton = ({ isOpen, onClick, isMobile }) => (
  <div className="modern-toggle-button" onClick={onClick}>
    <div className={`toggle-lines ${isOpen ? 'open' : ''}`}>
      <span className="line line1"></span>
      <span className="line line2"></span>
      <span className="line line3"></span>
    </div>
  </div>
);

// Constants
const ALARM_CHECK_INTERVAL = 5000;
const DATETIME_UPDATE_INTERVAL = 1000;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management with custom hooks
  const [isSidebarOpen, setIsSidebarOpen] = useLocalStorage('sidebarState', true);
  const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebarCollapsed', false);
  const [isMuted, setIsMuted] = useLocalStorage('alarmMuted', false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lastVisitedPath, setLastVisitedPath] = useState('/dashboard');

  const dateTime = useDateTime(DATETIME_UPDATE_INTERVAL);
  const { alarms, activeAlarmCount, hasNewAlarm } = useAlarms(ALARM_CHECK_INTERVAL);
  const { sound, playAlarm, stopAlarm } = useAudio('/alarm.wav');

  // Get user info from session storage
  const user = useMemo(() => ({
    username: sessionStorage.getItem("username") || "Guest",
    role: sessionStorage.getItem("role") || "Technician"
  }), []);

  // Navigation items based on user role with modern icons
  const navItems = useMemo(() => {
    const baseItems = [
      { path: "/dashboard", icon: faHome, text: "Dashboard", color: "#4ecdc4" }
    ];

    const adminItems = [
      { path: "/SLDTemplate", icon: faDiagramProject, text: "SLD", color: "#ff6b6b" },
      { path: "/inverter", icon: faSolarPanel, text: "Inverter", color: "#ffa726" },
      { path: "/heatmap", icon: faDiagramProject, text: "Heatmap", color: "#ab47bc" },
      { path: "/mfm", icon: faBolt, text: "MFM", color: "#ffee58" },
      { path: "/wms", icon: faWind, text: "WMS", color: "#42a5f5" },
      { path: "/TransformerScreen", icon: faPlug, text: "Transformer", color: "#66bb6a" },
      { path: "/AlarmScreen", icon: faBell, text: "Alarm", color: "#ef5350" },
      { path: "/CustomTrend", icon: faLineChart, text: "Custom Trend", color: "#26c6da" },
      { path: "/formula", icon: faCalculator, text: "Formula", color: "#8bc34a" },
      {
        path: "/report",
        icon: faFileAlt,
        text: "Report",
        color: "#ff7043",
        isExternal: true,
        url: window.location.hostname.includes("localhost")
          ? API_ENDPOINTS.report.local
          : API_ENDPOINTS.report.production,
      }
    ];

    const operatorItems = [
      { path: "/AlarmScreen", icon: faBell, text: "Alarm", color: "#ef5350" },
      {
        path: "/report",
        icon: faFileAlt,
        text: "Report",
        color: "#ff7043",
        isExternal: true,
        url: window.location.hostname.includes("localhost")
          ? API_ENDPOINTS.report.local
          : API_ENDPOINTS.report.production,
      }
    ];

    switch (user.role) {
      case 'Administrator':
        return [...baseItems, ...adminItems];
      case 'Operator':
        return [...baseItems, ...operatorItems];
      default:
        return baseItems;
    }
  }, [user.role]);

  // Handle alarm sound
  useEffect(() => {
    if (hasNewAlarm && !isMuted) {
      playAlarm();
    } else {
      stopAlarm();
    }
  }, [hasNewAlarm, isMuted, playAlarm, stopAlarm]);

  // Auto-collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile, setIsCollapsed]);

  // Event handlers
  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(prev => !prev);
    } else {
      setIsCollapsed(prev => !prev);
    }
  }, [isMobile, setIsSidebarOpen, setIsCollapsed]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted) {
        stopAlarm();
      } else if (hasNewAlarm) {
        playAlarm();
      }
      return newMuted;
    });
  }, [setIsMuted, stopAlarm, hasNewAlarm, playAlarm]);

  const handleNavigation = useCallback((item) => {
    if (item.isExternal && item.url) {
      window.open(item.url, "_blank");
    } else {
      setLastVisitedPath(location.pathname);
      navigate(item.path);
      if (isMobile) {
        setIsSidebarOpen(false);
      }
    }
  }, [navigate, location.pathname, isMobile, setIsSidebarOpen]);

  const toggleAlarmScreen = useCallback(() => {
    const isOnAlarmScreen = location.pathname === "/AlarmScreen";
    const targetPath = isOnAlarmScreen ? lastVisitedPath : "/AlarmScreen";

    if (!isOnAlarmScreen) {
      setLastVisitedPath(location.pathname);
    }
    navigate(targetPath);
  }, [location.pathname, lastVisitedPath, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  }, [navigate]);

  const handlePrintScreen = useCallback(() => {
    window.print();
  }, []);

  const handleScreenshot = useCallback(async () => {
    try {
      const canvas = await html2canvas(document.body);
      const link = document.createElement("a");
      link.download = `screenshot-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
    }
  }, []);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  const navigateToMap = useCallback(() => {
    navigate("/leaflet-map");
  }, [navigate]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.modern-user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  const sidebarClassName = useMemo(() => {
    if (isMobile) {
      return `modern-sidebar ${isSidebarOpen ? 'mobile-open' : 'mobile-closed'}`;
    }
    return `modern-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`;
  }, [isMobile, isSidebarOpen, isCollapsed]);

  const mainContentClassName = useMemo(() => {
    if (isMobile) {
      return 'modern-main-content mobile';
    }
    return `modern-main-content ${isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`;
  }, [isMobile, isCollapsed]);

  return (
    <div className="modern-layout-container">
      {/* Header with updated toggle button */}
      <header className="modern-header">
        <div className="header-content">
          <div className="header-left">
            <ModernToggleButton
              isOpen={(isMobile && isSidebarOpen) || (!isMobile && !isCollapsed)}
              onClick={toggleSidebar}
              isMobile={isMobile}
            />

            <div className="brand-section" onClick={navigateToMap}>
              <div className="brand-text">
                <h1 className="brand-name">SUN-SCADA</h1>
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="project-info">
              <Typography variant="h6" className="project-title">
                21.5 MWp JSPL SOLAR PROJECT - DHULE, MAHARASHTRA
              </Typography>
            </div>
          </div>

          <div className="header-right">
            <div className="action-buttons">
              <ModernActionButton
                icon={faCamera}
                tooltip="Take Screenshot"
                onClick={handleScreenshot}
                variant="screenshot"
              />

              <ModernActionButton
                icon={faPrint}
                tooltip="Print Page"
                onClick={handlePrintScreen}
                variant="print"
              />

              <ModernAlarmIndicator
                hasNewAlarm={hasNewAlarm}
                activeAlarmCount={activeAlarmCount}
                onClick={toggleAlarmScreen}
              />

              <ModernActionButton
                icon={isMuted ? faVolumeMute : faVolumeUp}
                tooltip={isMuted ? "Unmute Alarms" : "Mute Alarms"}
                onClick={toggleMute}
                variant={isMuted ? "muted" : "unmuted"}
              />
            </div>

            <div className="datetime-display">
              <Typography variant="body2" className="time-text">
                {dateTime}
              </Typography>
            </div>

            <ModernUserMenu
              user={user}
              showMenu={showUserMenu}
              onToggle={toggleUserMenu}
              onLogout={handleLogout}
            />

            {/* Bigger logo */}
            <img src={logo} alt="Company Logo" className="header-logo" />
          </div>
        </div>
      </header>

      {/* Sidebar (unchanged) */}
      <Slide direction="right" in={!isMobile || isSidebarOpen} mountOnEnter unmountOnExit>
        <aside className={sidebarClassName}>
          <nav className="modern-nav">
            <div className="nav-items">
              {navItems.map((item, index) => (
                <Tooltip
                  key={item.path}
                  title={isCollapsed && !isMobile ? item.text : ""}
                  placement="right"
                  arrow
                >
                  <div
                    className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                    onClick={() => handleNavigation(item)}
                    style={{'--item-color': item.color}}
                  >
                    <div className="nav-item-icon">
                      <FontAwesomeIcon icon={item.icon} />
                    </div>
                    {(!isCollapsed || isMobile) && (
                      <span className="nav-item-text">{item.text}</span>
                    )}
                    {location.pathname === item.path && (
                      <div className="active-indicator" />
                    )}
                  </div>
                </Tooltip>
              ))}
            </div>
          </nav>
        </aside>
      </Slide>

      {/* Main Content (unchanged) */}
      <main className={mainContentClassName}>
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
