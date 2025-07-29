import React from "react";
import { Container, Button, Typography } from "@mui/material";
import "./Report.css";
import { API_ENDPOINTS } from "../apiConfig";

const Report = () => {
  const getReportURL = () => {
    // Use environment variables for flexibility. Fallback to local for development.
    return process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_REPORT_SERVER_URL
      : API_ENDPOINTS.report.local;
  };

  const handleOpenReport = () => {
    const reportURL = getReportURL();
    window.open(reportURL, "_blank");
  };

  return (
    <Container className="report">
      <Typography variant="h5" gutterBottom>
        Reports
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpenReport}>
        Open Report
      </Button>
    </Container>
  );
};

export default Report;
