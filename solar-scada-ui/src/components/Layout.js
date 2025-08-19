import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  IconButton, Tooltip, Avatar, Badge, Chip, Fade, Slide,
  useTheme, useMediaQuery, Typography, Box, Divider
} from "@mui/material";
import {
  Menu as MenuIcon, Close as CloseIcon, KeyboardArrowDown as ArrowDownIcon,
  Dashboard, NotificationsActive, Timeline, Calculate,
  Description, CameraAlt, Print, VolumeOff, VolumeUp, PowerSettingsNew, Layers,
  AccountTree, Speed
} from "@mui/icons-material";
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import PowerIcon from '@mui/icons-material/Power';
import WindPowerIcon from '@mui/icons-material/WindPower';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
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

const useAudio = (src) => {
  const [sound, setSound] = useState(null);

  useEffect(() => {
    const audioSound = new Howl({
      src: [src],
      format: ["mp3", "wav"], // Add mp3 if needed
      loop: false,
      volume: 1.0,
      preload: true,
    });

    setSound(audioSound);

    return () => {
      audioSound.unload();
    };
  }, [src]);

  const playAlarm = useCallback(() => {
    if (sound) {
      sound.play();
      // Change to 2.5 seconds
      setTimeout(() => {
        sound.stop();
      }, 2500);
    }
  }, [sound]);

  const stopAlarm = useCallback(() => {
    sound?.stop();
  }, [sound]);

  return { sound, playAlarm, stopAlarm };
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
  const [isMuted, setIsMuted] = useLocalStorage('alarmMuted', false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [lastVisitedPath, setLastVisitedPath] = useState('/dashboard');

  const dateTime = useDateTime(DATETIME_UPDATE_INTERVAL);
  const { alarms, activeAlarmCount, hasNewAlarm, newAlarmDetected } = useAlarms(ALARM_CHECK_INTERVAL);
  const { sound, playAlarm, stopAlarm } = useAudio('/alarm.wav');
  //const { sound, playAlarm, stopAlarm } = useAudio('/gentle-chime.wav'); 
  // or: '/notification-ping.mp3'

  // Get user info from session storage
  const user = useMemo(() => ({
    username: sessionStorage.getItem("username") || "Guest",
    role: sessionStorage.getItem("role") || "Technician"
  }), []);

  // Navigation items with modern Material-UI icons
  const navItems = useMemo(() => {
    const baseItems = [
      { path: "/dashboard", icon: Dashboard, text: "Dashboard", color: "#4ecdc4" }
    ];

    const adminItems = [
      { path: "/SLDTemplate", icon: AccountTree, text: "SLD", color: "#ff6b6b" },
      { path: "/inverter", icon: SolarPowerIcon, text: "Inverter", color: "#ffa726" },
      { path: "/heatmap", icon: Layers, text: "Heatmap", color: "#ab47bc" },
      { path: "/mfm", icon: Speed, text: "MFM", color: "#ffee58" },
      { path: "/wms", icon: WindPowerIcon, text: "WMS", color: "#42a5f5" },
      { path: "/TransformerScreen", icon: PowerIcon, text: "Transformer", color: "#66bb6a" },
      { path: "/AlarmScreen", icon: NotificationsActive, text: "Alarm", color: "#ef5350" },
      { path: "/CustomTrend", icon: Timeline, text: "Custom Trend", color: "#26c6da" },
      { path: "/formula", icon: Calculate, text: "Formula", color: "#8bc34a" },
      {
        path: "/report",
        icon: Description,
        text: "Report",
        color: "#ff7043",
        isExternal: true,
        url: window.location.hostname.includes("localhost")
          ? API_ENDPOINTS.report.local
          : API_ENDPOINTS.report.production,
      }
    ];

    const operatorItems = [
      { path: "/AlarmScreen", icon: NotificationsActive, text: "Alarm", color: "#ef5350" },
      {
        path: "/report",
        icon: Description,
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

  // Handle alarm sound - only play when NEW alarms are detected
  useEffect(() => {
    if (newAlarmDetected && !isMuted) {
      playAlarm();
    }
  }, [newAlarmDetected, isMuted, playAlarm]);

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
      }
      return newMuted;
    });
  }, [setIsMuted, stopAlarm]);

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
                icon={<CameraAlt sx={{ fontSize: '0.9rem' }} />}
                tooltip="Take Screenshot"
                onClick={handleScreenshot}
                variant="screenshot"
              />

              <ModernActionButton
                icon={<Print sx={{ fontSize: '0.9rem' }} />}
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
                icon={isMuted ? <VolumeOff sx={{ fontSize: '0.9rem' }} /> : <VolumeUp sx={{ fontSize: '0.9rem' }} />}
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
    </div>
  );
};

export default Layout;