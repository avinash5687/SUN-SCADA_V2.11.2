import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/BACKGROUND.jpeg";
import logo from "../assets/logo.png";
import project_logo from "../assets/SUN-SCADA_Logo.png";
import { API_ENDPOINTS } from "../apiConfig";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [energyData, setEnergyData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("token")) {
      navigate("/leaflet-map");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.data.energyData);
        const data = await response.json();
        if (response.ok) {
          setEnergyData(data);
        } else {
          console.error("Error fetching energy data:", data.message);
        }
      } catch (error) {
        console.error("Server error:", error);
      }
    };

    fetchEnergyData();
    const interval = setInterval(fetchEnergyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const text = await response.text();

      if (response.ok) {
        const data = JSON.parse(text);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("role", data.role);
        navigate("/leaflet-map");
      } else {
        setError(text || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Server error. Try again later.");
    }
  };

  // Check for mobile screen width
  const isMobile = window.innerWidth <= 768;

  const styles = {
    container: {
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      position: "relative",
      padding: "20px",
    },
    header: {
      position: "absolute",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      color: "white",
      fontSize: "28px",
      fontWeight: "bold",
      textAlign: "center",
    },
    mainContent: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      padding: "20px", // Reduced padding
      opacity: "0.9",
      borderRadius: "10px",
      width: isMobile ? "95%" : "80%",
      maxWidth: "700px",
      height: isMobile ? "auto" : "280px", // Fixed height for desktop, auto for mobile
      display: "flex",
      justifyContent: "center",
      alignItems: "stretch",
      flexDirection: isMobile ? "column" : "row",
      gap: '12px', // Reduced gap
      marginTop: "40px",
    },
    energyDataSection: {
      color: "white",
      width: isMobile ? "100%" : "65%",
      background: "rgba(77, 77, 77, 0.6)",
      padding: "20px", // Reduced padding
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
    },
    energyDataTitle: {
      marginBottom: "10px", // Reduced margin
      fontSize: "22px", // Slightly smaller font
      fontWeight: "bold",
    },
    energyDataList: {
      listStyleType: "none",
      padding: "15px", // Reduced padding
      margin: "0",
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      background: "rgba(0, 0, 0, 0.6)",
      flex: "1",
      justifyContent: "center",
    },
    energyDataItem: {
      marginBottom: '8px', // Reduced margin
      fontSize: '15px', // Slightly smaller font
      lineHeight: "1.4", // Tighter line height
    },
    loginSection: {
      width: isMobile ? "100%" : "35%",
      textAlign: "center",
      background: "rgba(77, 77, 77, 0.6)",
      padding: "15px", // Reduced padding
      borderRadius: "10px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
    projectLogo: {
      height: "50px", // Reduced logo height
      marginBottom: "15px", // Reduced margin
    },
    input: {
      width: "100%",
      padding: "8px", // Reduced padding
      marginBottom: "12px", // Reduced margin
      borderRadius: "5px",
      border: "none",
      boxSizing: "border-box",
      fontSize: "14px", // Slightly smaller font
    },
    button: {
      width: "100%",
      padding: "8px", // Reduced padding
      backgroundColor: "#008080",
      color: "white",
      borderRadius: "5px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px", // Slightly smaller font
      transition: "background-color 0.3s ease",
    },
    footer: {
      position: "absolute",
      bottom: "20px",
      right: "20px",
      display: "flex",
      alignItems: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "22px",
    },
    footerLogo: {
      height: "32px",
      marginLeft: "10px",
    },
    errorText: {
        color: 'red',
        marginBottom: '8px', // Reduced margin
        fontSize: '12px', // Smaller font
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>
        DEMO SOLAR SCADA
        {/* <br />
        DHULE, MAHARASHTRA */}
      </h2>

      <div style={styles.mainContent}>
        <div style={styles.energyDataSection}>
          <h3 style={styles.energyDataTitle}>Current Energy Data</h3>
          <ul style={styles.energyDataList}>
            {energyData ? (
              <>
                <li style={styles.energyDataItem}>🔋 Energy Generated: {energyData.energyGenerated} MWh</li>
                <li style={styles.energyDataItem}>⚡ Current Power: {energyData.currentPower} MW</li>
                <li style={styles.energyDataItem}>🌍 CO₂ Saved: {energyData.co2Saved} kg</li>
                <li style={styles.energyDataItem}>🌳 Trees Saved: {energyData.treesSaved}</li>
              </>
            ) : (
              <li style={styles.energyDataItem}>Loading energy data...</li>
            )}
          </ul>
        </div>

        <div style={styles.loginSection}>
          <img src={project_logo} alt="Project Logo" style={styles.projectLogo} />
          {error && <p style={styles.errorText}>{error}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button 
              type="submit" 
              style={styles.button}
              onMouseOver={(e) => e.target.style.backgroundColor = "#006666"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#008080"}
            >
              Login
            </button>
          </form>
        </div>
      </div>

      <div style={styles.footer}>
        <span>Developed by</span>
        <img src={logo} alt="Logo" style={styles.footerLogo} />
      </div>
    </div>
  );
};

export default Login;
