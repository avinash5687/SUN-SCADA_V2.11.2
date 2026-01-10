import React, { useCallback, useEffect } from 'react';
import { IconButton, Tooltip, Fade, styled, tooltipClasses } from '@mui/material';
import { 
  Close as CloseIcon, 
  Chat as ChatIcon, 
  Close as CloseChatIcon, 
  KeyboardArrowLeft as ArrowLeftIcon 
} from '@mui/icons-material';
import { ChatbotComponent } from './ChatbotDataFlow';
import ChatBot_Icon from '../assets/ChatBot_Icon.png';
import './ChatbotWidget.css';

// Custom styled tooltip matching the theme
const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.98) 0%, rgba(35, 45, 63, 0.98) 100%)',
    backdropFilter: 'blur(10px)',
    color: '#e0e6ed',
    fontSize: '0.8rem',
    fontWeight: 500,
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(100, 149, 237, 0.4)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(100, 149, 237, 0.2)',
    letterSpacing: '0.3px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(26, 54, 93, 0.98)',
    '&::before': {
      border: '1px solid rgba(100, 149, 237, 0.4)',
      background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.98) 0%, rgba(35, 45, 63, 0.98) 100%)',
    },
  },
}));

// Enhanced Custom hook for localStorage persistence with sync across tabs/navigation
const useLocalStorage = (key, initialValue) => {
  // Always read from localStorage first, even on re-renders
  const readValue = useCallback(() => {
    try {
      const savedValue = localStorage.getItem(key);
      if (savedValue !== null) {
        return JSON.parse(savedValue);
      }
      // If no saved value, set the initial value
      localStorage.setItem(key, JSON.stringify(initialValue));
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = React.useState(readValue);

  // Update localStorage whenever value changes
  const setStoredValue = useCallback((newValue) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch custom event for cross-tab sync
      window.dispatchEvent(new Event('local-storage'));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, value]);

  // Listen for localStorage changes from other tabs/components
  useEffect(() => {
    const handleStorageChange = () => {
      setValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);

  return [value, setStoredValue];
};

const ChatbotWidget = ({ user, currentScreen }) => {
  // Persist both chat open state and visibility across navigation
  // Chatbot hidden by default on first login
  const [isChatFeatureVisible, setIsChatFeatureVisible] = useLocalStorage("chatFeatureVisible", false);
  const [isChatOpen, setIsChatOpen] = useLocalStorage("chatOpen", false);

  // Force re-read from localStorage on mount to ensure consistency
  useEffect(() => {
    try {
      const savedVisibility = localStorage.getItem("chatFeatureVisible");
      const savedChatOpen = localStorage.getItem("chatOpen");
      
      if (savedVisibility !== null) {
        setIsChatFeatureVisible(JSON.parse(savedVisibility));
      }
      if (savedChatOpen !== null) {
        setIsChatOpen(JSON.parse(savedChatOpen));
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, []);

  const toggleChatPopup = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, [setIsChatOpen]);

  const toggleChatFeature = useCallback(() => {
    setIsChatFeatureVisible(prev => {
      const newVisibility = !prev;
      if (!newVisibility && isChatOpen) {
        setIsChatOpen(false);
      }
      return newVisibility;
    });
  }, [isChatOpen, setIsChatFeatureVisible, setIsChatOpen]);

  return (
    <>
      <div className="chatbot-container">
        {isChatFeatureVisible ? (
          <>
            <Fade in={isChatOpen}>
              <div className="chatbot-popup">
                <ChatbotComponent user={user} isChatOpen={isChatOpen} currentScreen={currentScreen} />
              </div>
            </Fade>

            {/* Chat icon with cross positioned on top-right */}
            <div className="chatbot-icon-with-cross">
              <StyledTooltip title="Hide Chat Assistant" placement="left" arrow>
                <IconButton 
                  className="chatbot-cross-button-top" 
                  onClick={toggleChatFeature}
                  size="small"
                >
                  <CloseIcon sx={{ fontSize: '14px' }} />
                </IconButton>
              </StyledTooltip>

              <StyledTooltip title={isChatOpen ? "Close Chat" : "Open Assistant"} placement="left" arrow>
                <IconButton 
                  className="chatbot-toggle-button" 
                  onClick={toggleChatPopup}
                >
                  {isChatOpen ? (
                    <CloseChatIcon sx={{ fontSize: '28px' }} />
                  ) : (
                    <img 
                      src={ChatBot_Icon} 
                      alt="Assistant" 
                      className="chatbot-custom-icon"
                    />
                  )}
                </IconButton>
              </StyledTooltip>
            </div>
          </>
        ) : null}
      </div>

      {/* Right-side indicator when hidden */}
      {!isChatFeatureVisible && (
        <div className="chatbot-right-indicator">
          <StyledTooltip title="Show Assistant" placement="left" arrow>
            <IconButton 
              className="chatbot-unhide-indicator" 
              onClick={toggleChatFeature}
            >
              <img 
                src={ChatBot_Icon} 
                alt="Show Assistant" 
                className="chatbot-indicator-icon"
              />
              <ArrowLeftIcon sx={{ fontSize: '14px' }} className="indicator-arrow" />
            </IconButton>
          </StyledTooltip>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;