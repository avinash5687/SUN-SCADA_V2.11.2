import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StartupScreen.css'; // We'll create this next

const StartupScreen = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animationPhase, setAnimationPhase] = useState(0);

  // Sequential animation phases
  useEffect(() => {
    const animationSequence = [
      { delay: 0, phase: 1 },      // Header animation
      { delay: 600, phase: 2 },    // Title
      { delay: 1200, phase: 3 },   // Feature icons
      { delay: 1800, phase: 4 },   // System status
      { delay: 2400, phase: 5 },   // Sun animation
      { delay: 3000, phase: 6 }    // Button & Footer
    ];

    animationSequence.forEach(({ delay, phase }) => {
      setTimeout(() => {
        setAnimationPhase(phase);
      }, delay);
    });
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="startup-screen">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="grid-background"></div>
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      {/* Header */}
      <div className={`header ${animationPhase >= 1 ? 'animate-in' : ''}`}>
        <div className="header-content">
          {/* Animated SUN-SCADA Logo */}
          <div className="logo-section">
            <div className="sun-logo">
              <div className="sun-main"></div>
              {/* Sun Rays */}
              <div className="sun-rays">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="sun-ray"
                    style={{
                      transform: `rotate(${i * 45}deg)`,
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="logo-text">
              <h1>SUN-SCADA</h1>
              <p>Solar Power Monitoring System</p>
            </div>
          </div>
          
          {/* Heyday Ventures Logo */}
          <div className="company-section">
            <div className="company-info">
              <div className="company-text">
                <div>Heyday Ventures</div>
                <div>Powering Innovation</div>
              </div>
              <div className="company-logo">H</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Title Section */}
        <div className={`title-section ${animationPhase >= 2 ? 'animate-in' : ''}`}>
          <h2>Advanced Solar Monitoring Platform</h2>
          <p className="subtitle">Real-time Data Analytics & Control Dashboard</p>
          <p className="description">Comprehensive SCADA Solution for Solar Energy Management</p>
        </div>

        {/* Feature Icons */}
        <div className={`features-section ${animationPhase >= 3 ? 'animate-in' : ''}`}>
          {[
            { 
              icon: '🌞', 
              label: 'Real Time Monitor', 
              description: 'Live solar panel performance tracking with instant data updates'
            },
            { 
              icon: '📡', 
              label: 'Remote Monitor', 
              description: 'Monitor distant solar installations from centralized location'
            },
            { 
              icon: '🖥️', 
              label: 'Central Monitor', 
              description: 'Unified dashboard for multiple sites and comprehensive oversight'
            },
            { 
              icon: '🌤️', 
              label: 'Weather Monitor', 
              description: 'Real-time weather conditions affecting solar performance'
            },
            { 
              icon: '📊', 
              label: 'Analytics', 
              description: 'Advanced data analysis and performance optimization insights'
            },
            { 
              icon: '✅', 
              label: 'PM Kusum Compliance', 
              description: 'Government scheme compliance monitoring and reporting'
            }
          ].map((item, index) => (
            <div key={index} className="feature-item" style={{ animationDelay: `${index * 150}ms` }}>
              <div className={`feature-icon feature-${index}`}>{item.icon}</div>
              <span className="feature-label">{item.label}</span>
              <p className="feature-description">{item.description}</p>
            </div>
          ))}
        </div>

        {/* System Status
        <div className={`status-section ${animationPhase >= 4 ? 'animate-in' : ''}`}>
          {[
            { name: 'Real Time Monitor', status: 'ONLINE', color: 'green', description: 'Live data streaming active' },
            { name: 'Remote Monitor', status: 'ACTIVE', color: 'blue', description: 'Remote sites connected' },
            { name: 'Central Monitor', status: 'SYNCED', color: 'purple', description: 'All systems synchronized' },
            { name: 'Weather Monitor', status: 'TRACKING', color: 'cyan', description: 'Weather data updated' },
            { name: 'Analytics Engine', status: 'PROCESSING', color: 'green', description: 'Data analysis running' },
            { name: 'PM Kusum Compliance', status: 'VERIFIED', color: 'orange', description: 'Compliance status valid' }
          ].map((system, index) => (
            <div key={index} className="status-card">
              <div className={`status-indicator status-${system.color}`}></div>
              <div className="status-info">
                <div className="status-name">{system.name}</div>
                <div className={`status-text status-${system.color}`}>{system.status}</div>
                <div className="status-description">{system.description}</div>
              </div>
            </div>
          ))}
        </div> */}

        {/* Central Sun Animation */}
        <div className={`sun-animation ${animationPhase >= 5 ? 'animate-in' : ''}`}>
          <div className="central-sun">
            <div className="sun-core">☀️</div>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="sun-beam"
                style={{
                  transform: `rotate(${i * 30}deg)`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
        </div>

        {/* Dashboard Button */}
        <div className={`button-section ${animationPhase >= 6 ? 'animate-in' : ''}`}>
          <button 
            className="dashboard-button"
            onClick={() => navigate('/dashboard')} // Update this path as needed
          >
            Enter Dashboard
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={`footer ${animationPhase >= 6 ? 'animate-in' : ''}`}>
        <div className="footer-content">
          <div className="footer-left">
            <span>SUN-SCADA by Heyday Ventures</span>
            <span>© 2025 All Rights Reserved</span>
          </div>
          <div className="footer-right">
            <div className="time">{currentTime.toLocaleTimeString()}</div>
            <div className="date">{currentTime.toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupScreen;
