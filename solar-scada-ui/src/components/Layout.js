import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  IconButton, Tooltip, Avatar, Badge, Chip, Fade, Slide,
  useTheme, useMediaQuery, Typography, Box, Divider
} from "@mui/material";
import {
  Menu as MenuIcon, Close as CloseIcon, KeyboardArrowDown as ArrowDownIcon,
  Dashboard, NotificationsActive, Timeline, Calculate,
  Description, PowerSettingsNew, Layers,
  AccountTree, Speed
} from "@mui/icons-material";
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import PowerIcon from '@mui/icons-material/Power';
import WindPowerIcon from '@mui/icons-material/WindPower';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import SmbIcon from '@mui/icons-material/OfflineBolt';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Layout.css";
import logo from "../assets/logo.png";
import project_logo from "../assets/SUN-SCADA_Logo.png";
import { API_ENDPOINTS } from "../apiConfig";

// Import the ChatbotWidget component
import ChatbotWidget from "./ChatbotWidget";

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

// Custom hooks
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

// Global variable to persist alarm count across navigation
let globalPreviousAlarmCount = 0;
let isInitialAlarmLoad = true;
let lastAlarmTriggerTime = 0;

const useAlarms = (interval) => {
  const [alarms, setAlarms] = useState([]);
  const [activeAlarmCount, setActiveAlarmCount] = useState(0);
  const [hasNewAlarm, setHasNewAlarm] = useState(false);
  const [newAlarmDetected, setNewAlarmDetected] = useState(false);

  useEffect(() => {
    const checkForAlarms = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.alarm.getAll);
        const activeUnacknowledgedAlarms = response.data.filter(
          (alarm) => alarm.status === "ON" && !alarm.acknowledged
        );

        const currentActiveCount = activeUnacknowledgedAlarms.length;
        const currentTime = Date.now();

        setAlarms(response.data);
        setActiveAlarmCount(currentActiveCount);
        setHasNewAlarm(currentActiveCount > 0);

        // Only trigger new alarm detection if:
        // 1. Count increased from previous
        // 2. Not initial load
        // 3. At least 3 seconds have passed since last trigger (prevents navigation issues)
        if (
          currentActiveCount > globalPreviousAlarmCount && 
          !isInitialAlarmLoad &&
          (currentTime - lastAlarmTriggerTime) > 3000
        ) {
          setNewAlarmDetected(true);
          lastAlarmTriggerTime = currentTime;
          // Reset the detection flag after a short delay
          setTimeout(() => setNewAlarmDetected(false), 1000);
        }

        globalPreviousAlarmCount = currentActiveCount;
        isInitialAlarmLoad = false;
      } catch (error) {
        console.error("Error fetching alarms:", error);
      }
    };

    checkForAlarms();
    const alarmInterval = setInterval(checkForAlarms, interval);
    return () => clearInterval(alarmInterval);
  }, [interval]);

  return { alarms, activeAlarmCount, hasNewAlarm, newAlarmDetected };
};

// Modern Sub-components
const ModernAlarmIndicator = ({ hasNewAlarm, activeAlarmCount, onClick }) => (
  <div className="modern-notification-container" onClick={onClick}>
    <Badge
      badgeContent={activeAlarmCount}
      color="error"
      max={99}
      overlap="circular"
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "0.5rem",      // Smaller font size
          height: "14px",           // Smaller height
          minWidth: "14px",         // Smaller min width
          padding: "0 4px"          // Reduced padding
        }
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
        <div className="user-avatar-wrapper">
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
          <div className="user-info-text">
            <span>{user.username}</span>
            <span style={{ color: getRoleColor(user.role) }}>{user.role}</span>
          </div>
        </div>
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
            <PowerSettingsNew sx={{ fontSize: '0.9rem' }} />
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
          {icon}
        </Badge>
      ) : (
        icon
      )}
    </div>
  </Tooltip>
);

// Modern Toggle Button Component
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lastVisitedPath, setLastVisitedPath] = useState('/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Dashboard');

  const dateTime = useDateTime(DATETIME_UPDATE_INTERVAL);
  const { alarms, activeAlarmCount, hasNewAlarm, newAlarmDetected } = useAlarms(ALARM_CHECK_INTERVAL);

  // Get user info from session storage
  const user = useMemo(() => ({
    username: sessionStorage.getItem("username") || "Guest",
    role: sessionStorage.getItem("role") || "Technician"
  }), []);

  // Navigation items with modern Material-UI icons
  const navItems = useMemo(() => {
    const basePrefix = "/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA";
    const baseItems = [
      { path: `${basePrefix}/Dashboard`, icon: Dashboard, text: "Dashboard", color: "#4ecdc4" }
    ];

    const adminItems = [
      { path: `${basePrefix}/InverterScreen`, icon: SolarPowerIcon, text: "Inverter", color: "#ffa726" },
      { path: `${basePrefix}/InverterHeatmap`, icon: Layers, text: "Inverter Heatmap", color: "#ab47bc" },
      { path: `${basePrefix}/SmbScreen`, icon: SmbIcon, text: "SMB", color: "#26c6da" },
      { path: `${basePrefix}/SmbHeatmap`, icon: ElectricalServicesIcon, text: "SMB Heatmap", color: "#29b6f6" },
      { path: `${basePrefix}/MfmScreen`, icon: Speed, text: "MFM", color: "#ffee58" },
      { path: `${basePrefix}/WmsScreen`, icon: WindPowerIcon, text: "WMS", color: "#42a5f5" },
      { path: `${basePrefix}/TransformerScreen`, icon: PowerIcon, text: "Transformer", color: "#66bb6a" },
      { path: `${basePrefix}/AlarmScreen`, icon: NotificationsActive, text: "Alarm", color: "#ef5350" },
      { path: `${basePrefix}/SLDTemplate`, icon: AccountTree, text: "SLD", color: "#ff6b6b" },
      { path: `${basePrefix}/CustomTrend`, icon: Timeline, text: "Custom Trend", color: "#26c6da" },
      { path: `${basePrefix}/FormulaScreen`, icon: Calculate, text: "Formula", color: "#8bc34a" },
      { path: `${basePrefix}/ReportPage`, icon: Description, text: "Report", color: "#ff7043"}
    ];

    const operatorItems = [
      { path: `${basePrefix}/AlarmScreen`, icon: NotificationsActive, text: "Alarm", color: "#ef5350" },
      { path: `${basePrefix}/ReportPage`, icon: Description, text: "Report", color: "#ff7043" }
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
    const basePrefix = "/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA";
    const isOnAlarmScreen = location.pathname === `${basePrefix}/AlarmScreen`;
    const targetPath = isOnAlarmScreen ? lastVisitedPath : `${basePrefix}/AlarmScreen`;

    if (!isOnAlarmScreen) {
      setLastVisitedPath(location.pathname);
    }
    navigate(targetPath);
  }, [location.pathname, lastVisitedPath, navigate]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Login");
  }, [navigate]);

  const toggleUserMenu = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  const navigateToMap = useCallback(() => {
    navigate("/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Leaflet-Map");
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
      {/* Header */}
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
                <img src={project_logo} alt="Brand Logo" className="brand-logo" />
              </div>
            </div>
          </div>

          <div className="header-center">
            <div className="project-info">
              <Typography variant="h6" className="project-title">
                DEMO SOLAR SCADA - 21.5 Mw
              </Typography>
            </div>
          </div>

          <div className="header-right">
            <div className="action-buttons">
              <div className="datetime-display">
                <Typography variant="body2" className="time-text">
                  {dateTime}
                </Typography>
              </div>
              <ModernAlarmIndicator
                hasNewAlarm={hasNewAlarm}
                activeAlarmCount={activeAlarmCount}
                onClick={toggleAlarmScreen}
              />
            </div>
            <ModernUserMenu
              user={user}
              showMenu={showUserMenu}
              onToggle={toggleUserMenu}
              onLogout={handleLogout}
            />
            <img src={logo} alt="Company Logo" className="header-logo" />
          </div>
        </div>
      </header>

      {/* Sidebar */}
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
                      <item.icon sx={{ fontSize: '1rem' }} />
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

      {/* Main Content */}
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

      {/* Chatbot Widget */}
      <ChatbotWidget />

    </div>
  );
};

export default Layout;