import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/Heyday-Ventures-Private-Limited/Demo_Solar_SCADA/Login" replace />;
};

export default PrivateRoute;
