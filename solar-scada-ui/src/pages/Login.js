import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/BACKGROUND.jpeg";
import logo from "../assets/logo.png";
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

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <h2
        style={{
          position: "absolute",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "28px",
          fontWeight: "bold",
        }}
      >
        21.5MWp JSPL SOLAR PROJECT, DHULE, MAHARASHTRA
      </h2>

      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          padding: "20px",
          opacity: "90%",
          borderRadius: "10px",
          width: "60%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "50px",
        }}
      >
        <div
          style={{
            color: "white",
            width: "70%",
            background: "rgba(77, 77, 77, 0.6)",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Current Energy Data</h3>
          <ul
            style={{
              listStyleType: "none",
              padding: "20px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              background: "rgba(0, 0, 0, 0.6)",
            }}
          >
            {energyData ? (
              <>
                <li>🔋 Energy Generated: {energyData.energyGenerated} MWh</li>
                <li>⚡ Current Power: {energyData.currentPower} MW</li>
                <li>🌍 CO₂ Saved: {energyData.co2Saved} kg</li>
                <li>🌳 Trees Saved: {energyData.treesSaved}</li>
              </>
            ) : (
              <li>Loading energy data...</li>
            )}
          </ul>
        </div>

        <div
          style={{
            width: "30%",
            textAlign: "center",
            marginLeft: "10px",
            background: "rgba(77, 77, 77, 0.6)",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3 style={{ color: "white", marginBottom: "10px" }}>Login</h3>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
              }}
              required
            />
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#008080",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: "22px",
        }}
      >
        <span>Developed by</span>
        <img
          src={logo}
          alt="Logo"
          style={{
            height: "80px",
            marginLeft: "10px",
          }}
        />
      </div>
    </div>
  );
};

export default Login;
