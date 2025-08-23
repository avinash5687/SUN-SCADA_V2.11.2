import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";
import './LandingPage.css';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const navigate = useNavigate();

  const features = [
    {
      icon: "⚡",
      title: "Real-time Monitoring",
      description: "Monitor your solar plant performance in real-time"
    },
    {
      icon: "📊", 
      title: "Data Analytics",
      description: "Comprehensive data analysis and visualization"
    },
    {
      icon: "🔧",
      title: "Smart Management",
      description: "Intelligent system management with alerts"
    },
    {
      icon: "🏛️",
      title: "PM Kusum Compliant",
      description: "Fully compliant with PM Kusum guidelines for government solar subsidy schemes with automated documentation"
    }
  ];

  const stats = [
    { value: "21.5", unit: "MWp", label: "Solar Capacity" },
    { value: "99.9", unit: "%", label: "Uptime" },
    { value: "24/7", unit: "", label: "Monitoring" },
    { value: "1000+", unit: "", label: "Data Points" }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, []);

  const handleLearnMore = () => {
    window.open('https://heyday-ventures.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="floating-shapes">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`shape shape-${i + 1}`} />
          ))}
        </div>
        {/* Moving Clouds */}
        <div className="clouds">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`cloud cloud-${i + 1}`} />
          ))}
        </div>
      </div>

      {/* Header with Logo */}
      <header className={`landing-header ${isLoaded ? 'loaded' : ''}`}>
        <div className="header-content">
          <div className="logo-section" onClick={() => navigate('/dashboard')}>
            <div className="logo-icon">☀️</div>
            <h1 className="logo-text">SUN-SCADA</h1>
          </div>
          <div className="company-logo">
            <img src={logo} alt="Company Logo" className="header-logo" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`hero-section ${isLoaded ? 'loaded' : ''}`}>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Advanced Solar Plant
              <span className="highlight">SCADA System</span>
            </h1>
            
            <p className="hero-subtitle">
              Monitor, analyze, and optimize your solar power generation with 
              our cutting-edge SCADA technology for maximum efficiency and PM Kusum compliance.
            </p>
            <div className="hero-actions">
              <button 
                onClick={() => navigate('/dashboard')}
                className="cta-btn primary"
              >
                <span>Explore Dashboard</span>
                <div className="btn-arrow">→</div>
              </button>
              
              <button 
                className="cta-btn secondary"
                onClick={handleLearnMore}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Enhanced Solar Animation */}
          <div className="hero-visual">
            <div className="solar-system-visual">
              {/* Dynamic Sky Background */}
              <div className="sky">
                <div className="moving-clouds">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`sky-cloud sky-cloud-${i + 1}`} />
                  ))}
                </div>
              </div>
              
              {/* Animated Sun with Day/Night Cycle */}
              <div className="sun-container">
                <div className="sun">
                  <div className="sun-core"></div>
                </div>
                <div className="sun-rays">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className={`ray ray-${i + 1}`} />
                  ))}
                </div>
              </div>

              {/* Wind Turbine */}
              <div className="wind-turbine">
                <div className="turbine-tower"></div>
                <div className="turbine-blades">
                  <div className="blade blade-1"></div>
                  <div className="blade blade-2"></div>
                  <div className="blade blade-3"></div>
                </div>
              </div>
              
              {/* Ground with Enhanced Solar Farm */}
              <div className="ground">
                <div className="solar-panels">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`solar-panel panel-${i + 1}`}>
                      <div className="panel-surface"></div>
                      <div className="panel-frame"></div>
                    </div>
                  ))}
                </div>
                
                {/* Energy Generation Visualization */}
                <div className="energy-flow">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`energy-particle energy-${i + 1}`} />
                  ))}
                </div>
                
                {/* Enhanced Weather Station */}
                <div className="weather-station">
                  <div className="station-tower"></div>
                  <div className="weather-sensors">
                    <div className="sensor-array"></div>
                    <div className="data-collector"></div>
                  </div>
                </div>
                
                {/* Control System with Animation */}
                <div className="control-system">
                  <div className="system-box">
                    <div className="display-screen"></div>
                  </div>
                  <div className="status-lights">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`status-light light-${i + 1}`} />
                    ))}
                  </div>
                </div>

                {/* Power Transmission Lines */}
                <div className="power-lines">
                  <div className="transmission-tower"></div>
                  <div className="power-cables">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`cable cable-${i + 1}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="stat-value">
                {stat.value}
                <span className="stat-unit">{stat.unit}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Powerful Features</h2>
        
        <div className="features-grid">
          <div className="featured-item">
            <div className="feature-icon">
              {features[currentFeature].icon}
            </div>
            <h3 className="feature-title">{features[currentFeature].title}</h3>
            <p className="feature-description">{features[currentFeature].description}</p>
          </div>
          
          <div className="feature-indicators">
            {features.map((_, index) => (
              <button
                key={index}
                className={`indicator ${currentFeature === index ? 'active' : ''}`}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Optimize Your Solar Plant?</h2>
          <p>Join the future of solar energy management with PM Kusum compliance</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="final-cta"
          >
            Start Monitoring Now
          </button>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-logo">
              <div className="footer-logo-icon">☀️</div>
              <h3>SUN-SCADA</h3>
            </div>
            <div className="footer-info">
              <p>&copy; 2025 SUN-SCADA by Heyday Ventures, Delhi India</p>
              <p>Advanced Solar Monitoring Solutions</p>
            </div>
          </div>
          <div className="footer-links">
            <span>21.5 MWp JSPL Solar Project - Dhule, Maharashtra</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
