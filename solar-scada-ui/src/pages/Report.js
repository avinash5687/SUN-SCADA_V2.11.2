import React from "react";
import { Container, Button, Typography } from "@mui/material";
import "./Report.css";

const Report = () => {
  const handleOpenReport = () => {
    window.open("http://desktop-gljei74/ReportServer/Pages/ReportViewer.aspx?%2f10MW_SOLAR%2fReport1&rs:Command=Render", "_blank");
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
