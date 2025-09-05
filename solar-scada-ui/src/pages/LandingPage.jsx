import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";
import project_logo from "../assets/SUN-SCADA_Logo.png";
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    
    // Auto-cycle through features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      id: 1,
      title: "Real Time Monitor",
      icon: "⚡",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: 2,
      title: "Remote Monitor", 
      icon: "🌐",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: 3,
      title: "Centralized Monitor",
      icon: "🏢",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      id: 4,
      title: "Analytics",
      icon: "📊",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    {
      id: 5,
      title: "PM KUSUM",
      icon: "✅",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    {
      id: 6,
      title: "SCADA System",
      icon: "⚙️",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    }
  ];

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="floating-shapes">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`floating-shape shape-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* Compact Header */}
      <header className={`landing-header ${isLoaded ? 'loaded' : ''}`}>
        <div className="header-content">
          <div className="logo-left">
            <img src={project_logo} alt="SUN-SCADA" className="sun-scada-logo" />
          </div>
          <div className="header-center">
            <span className="tagline-text">Inaugurated by :- Shri Rambaran, Chief Engineer (Uttar Pradesh SLDC)</span>
          </div>
          <div className="logo-right">
            <img src={logo} alt="Heyday Ventures" className="heyday-logo" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="hero-section">
          {/* Left Side - Content */}
          <div className={`hero-content ${isLoaded ? 'loaded' : ''}`}>
            <h1 className="hero-title">
              <span className="title-highlight">SUN-SCADA</span>
              <span className="title-line">FOR PM KUSUM</span>
            </h1>
            
            <p className="hero-description">
              Transform your solar operations with AI-powered SCADA solution. 
              Real-time analytics, predictive maintenance, and seamless integration.
            </p>

            <div className="cta-container">
              <button 
                className="cta-primary" 
                onClick={handleNavigateToDashboard}
              >
                <span className="cta-text">Launch Dashboard</span>
                <span className="cta-icon">🚀</span>
              </button>
            </div>
          </div>

          {/* Right Side - Dashboard Preview */}
          <div className={`hero-visual ${isLoaded ? 'loaded' : ''}`}>
            <div className="dashboard-preview">
              <div className="preview-screen">
                <div className="screen-header">
                  <div className="screen-dots">
                    <span></span><span></span><span></span>
                  </div>
                  <div className="screen-title">Dashboard</div>
                </div>
                <div className="screen-content">
                  <div className="preview-charts">
                    <div className="chart-item chart-1"></div>
                    <div className="chart-item chart-2"></div>
                    <div className="chart-item chart-3"></div>
                  </div>
                  <div className="preview-metrics">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`metric-card metric-${i + 1}`}>
                        <div className="metric-icon"></div>
                        <div className="metric-data">
                          <div className="metric-line"></div>
                          <div className="metric-line short"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compelling Features Section */}
        <section className="features-section">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`feature-card ${activeFeature === index ? 'active' : ''} ${isLoaded ? 'loaded' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  background: activeFeature === index ? feature.gradient : ''
                }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="feature-icon-container">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="icon-sparkles">
                    <span className="sparkle sparkle-1">✨</span>
                    <span className="sparkle sparkle-2">⭐</span>
                    <span className="sparkle sparkle-3">💫</span>
                  </div>
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">{feature.title}</h3>
                </div>
                
                {/* Multiple animated rings */}
                <div className="feature-rings">
                  <div className="pulse-ring ring-1"></div>
                  <div className="pulse-ring ring-2"></div>
                  <div className="pulse-ring ring-3"></div>
                </div>
                
                {/* Floating particles */}
                <div className="floating-particles">
                  <div className="particle particle-1"></div>
                  <div className="particle particle-2"></div>
                  <div className="particle particle-3"></div>
                  <div className="particle particle-4"></div>
                </div>
                
                {/* Morphing background */}
                <div className="morphing-bg"></div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Compact Footer */}
      <footer className="landing-footer">
        <p>&copy; 2025 SUN-SCADA by Heyday Ventures. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;