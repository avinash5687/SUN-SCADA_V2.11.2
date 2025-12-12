import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Fade,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SmartToy as BotIcon,
  Person as UserIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon
} from '@mui/icons-material';

// Import the screen-based Q&A config
import { getScreenOptions } from './chatbotScreenQA';

// Screen-aware Chatbot Component
// Pass currentScreen from parent (e.g., "Dashboard", "Inverter", "MFMScreen")
export const ChatbotComponent = ({ user, isChatOpen, currentScreen }) => {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      initializeChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen]);

  // Optional: when the screen changes and chat is open, refresh options
  useEffect(() => {
    if (!isChatOpen) return;
    if (messages.length > 0) {
      addBotMessage(`Switched to ${currentScreen || 'this section'}.`);
      setTimeout(() => {
        showMainMenu();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen]);

  const initializeChat = () => {
    setMessages([]);
    setCurrentStep('welcome');
    setTimeout(() => {
      addBotMessage(
        `Hello ${user?.username || 'there'}! I'm Zyra your Assistant. How can I assist you${currentScreen ? ' with ' + currentScreen : ''} today?`,
        'welcome'
      );
      setTimeout(() => {
        showMainMenu();
      }, 800);
    }, 300);
  };

  const addBotMessage = (text, step = null) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'bot',
          text,
          timestamp: new Date(),
          step
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        text,
        timestamp: new Date()
      }
    ]);
  };

  // Use screen-aware options from config
  const showMainMenu = () => {
    const options = getScreenOptions(currentScreen);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'options',
        options,
        text: `What would you like to know${currentScreen ? ' about ' + currentScreen : ''}?`
      }
    ]);
  };

  // Select an option with embedded answer
  const handleOptionSelect = (option) => {
    addUserMessage(option.text);
    setCurrentStep(option.id);

    setTimeout(() => {
      addBotMessage(option.answer || 'Information not available for this topic.');
      setTimeout(() => {
        showContinueOptions();
      }, 1200);
    }, 300);
  };

  const showContinueOptions = () => {
    const continueOptions = [
      { id: 'back_to_main', text: '← Ask another question', icon: '🏠' },
      { id: 'restart', text: '🔄 Start Over', icon: '🔄' }
    ];

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'options',
        options: continueOptions,
        text: 'What would you like to do next?'
      }
    ]);
  };

  // Only handle navigation actions here
  const handleAction = (actionId) => {
    switch (actionId) {
      case 'back_to_main':
        addUserMessage('Ask another question');
        setTimeout(() => {
          addBotMessage(`Here are the questions for ${currentScreen || 'this section'}:`);
          setTimeout(showMainMenu, 600);
        }, 300);
        break;
      case 'restart':
        addUserMessage('Start Over');
        setTimeout(initializeChat, 300);
        break;
      default:
        break;
    }
  };

  const resetChat = () => {
    initializeChat();
  };

  if (!isChatOpen) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        borderRadius: '20px',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          color: 'white',
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(102, 126, 234, 0.2)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              background: 'linear-gradient(135deg, #4facfe, #00f2fe)'
            }}
          >
            <BotIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px' }}>
            Zyra - Solar Plant Assistant
          </Typography>
        </Box>
        <Tooltip title="Restart Conversation">
          <IconButton
            onClick={resetChat}
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Messages */}
      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.05)', borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '3px'
          }
        }}
      >
        {messages.map((message) => (
          <Fade key={message.id} in={true} timeout={300}>
            <Box>
              {message.type === 'bot' && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      fontSize: 12
                    }}
                  >
                    <BotIcon sx={{ fontSize: 12 }} />
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '85%',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      borderRadius: '12px 12px 12px 4px',
                      fontSize: '13px',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '13px' }}>
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {message.type === 'user' && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: '85%',
                      background: 'linear-gradient(135deg, #e3f2fd, #f8f9ff)',
                      color: '#1565c0',
                      borderRadius: '12px 12px 4px 12px',
                      border: '1px solid #e1f5fe'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500 }}>
                      {message.text}
                    </Typography>
                  </Paper>
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      background: 'linear-gradient(135deg, #42a5f5, #1e88e5)',
                      fontSize: 12
                    }}
                  >
                    <UserIcon sx={{ fontSize: 12 }} />
                  </Avatar>
                </Box>
              )}

              {message.type === 'options' && (
                <Box sx={{ mt: 1 }}>
                  {message.text && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          fontSize: 12
                        }}
                      >
                        <HelpIcon sx={{ fontSize: 12 }} />
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: '13px', color: '#555', fontWeight: 500, mt: 0.3 }}
                      >
                        {message.text}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 4 }}>
                    {message.options.map((option) => (
                      <Button
                        key={option.id}
                        variant="outlined"
                        onClick={() =>
                          option.answer ? handleOptionSelect(option) : handleAction(option.id)
                        }
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          p: 1.5,
                          borderRadius: '10px',
                          background:
                            'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
                          border: '1px solid rgba(102, 126, 234, 0.3)',
                          color: '#667eea',
                          fontSize: '12px',
                          fontWeight: 500,
                          textTransform: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background:
                              'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '14px' }}>{option.icon}</span>
                          {option.text}
                        </Box>
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Fade>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                background: 'linear-gradient(135deg, #667eea, #764ba2)'
              }}
            >
              <BotIcon sx={{ fontSize: 12 }} />
            </Avatar>
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                background: '#f5f5f5',
                borderRadius: '12px 12px 12px 4px',
                display: 'flex',
                gap: 0.5
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#667eea',
                  animation: 'typing 1.4s infinite ease-in-out',
                  animationDelay: '0s'
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#667eea',
                  animation: 'typing 1.4s infinite ease-in-out',
                  animationDelay: '0.2s'
                }}
              />
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#667eea',
                  animation: 'typing 1.4s infinite ease-in-out',
                  animationDelay: '0.4s'
                }}
              />
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Global styles for animation */}
      <style jsx global>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </Paper>
  );
};