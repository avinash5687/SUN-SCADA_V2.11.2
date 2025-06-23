import React from "react";
import { Container, Button, Typography } from "@mui/material";
import "./Report.css";

const Report = () => {
  const getReportURL = () => {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    return isLocal
      ? "http://localhost/ReportServer/Pages/ReportViewer.aspx?%2fReport+Parts%2fIndex_Page&rs:Command=Render"
      : "http://103.102.234.177/ReportServer/Pages/ReportViewer.aspx?%2fReport+Parts%2fIndex_Page&rs:Command=Render";
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
