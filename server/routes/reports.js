const express = require('express');
const router = express.Router();
const sql = require('mssql');
const ExcelJS = require('exceljs');

// Report type to stored procedure mapping
const REPORT_PROCEDURES = {
  fn_report_inverter: 'spReportInverter',
  fn_report_mfm: 'spReportMFM',
  fn_report_smb: 'spReportSMB',
  fn_report_trafo: 'spReportTrafo',
  fn_report_wms: 'spReportWMS',
  fn_report_dgr: 'spReportDGR',
  fn_report_alarms: 'spReportAlarms',
};

// Get list of available report types
router.get('/list', async (req, res) => {
  try {
    const reportTypes = [
      { funcName: "fn_report_inverter", displayName: "Inverter Report" },
      { funcName: "fn_report_mfm", displayName: "MFM Report" },
      { funcName: "fn_report_smb", displayName: "SMB Report" },
      { funcName: "fn_report_trafo", displayName: "Transformer Report" },
      { funcName: "fn_report_wms", displayName: "WMS Report" },
      { funcName: "fn_report_dgr", displayName: "DGR Report" },
      { funcName: "fn_report_alarms", displayName: "Alarms Report" },
    ];
    
    console.log('✅ Report list sent:', reportTypes.length, 'reports');
    res.json(reportTypes);
  } catch (error) {
    console.error('❌ Error fetching report list:', error);
    res.status(500).json({ error: 'Failed to fetch report list' });
  }
});

// Get devices for a specific report type
router.get('/devices', async (req, res) => {
  try {
    const { devicename } = req.query;
    
    console.log('📡 Fetching devices for:', devicename);

    if (!devicename) {
      console.error('❌ No device name provided');
      return res.status(400).json({ error: 'Device name is required' });
    }

    // Check if pool exists
    if (!req.app.locals.db) {
      console.error('❌ Database pool not available');
      return res.status(500).json({ error: 'Database connection not available' });
    }

    const pool = req.app.locals.db;
    
    // Simple query without stored procedure
    const result = await pool.request()
      .input('DEVICENAME', sql.NVarChar, devicename)
      .query(`
        SELECT 
          deviceid, 
          devicename + '-' + CAST(deviceid AS VARCHAR) AS name,
          internalName
        FROM DeviceMapping
        WHERE devicename = @DEVICENAME 
          AND deviceid IS NOT NULL 
          AND deviceid <> 0
        ORDER BY deviceid
      `);

    console.log('✅ Devices found:', result.recordset.length);
    console.log('📋 Device data:', JSON.stringify(result.recordset, null, 2));
    
    res.json(result.recordset);
    
  } catch (error) {
    console.error('❌ Error fetching devices:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      state: error.state,
      class: error.class,
      lineNumber: error.lineNumber,
      serverName: error.serverName,
      procName: error.procName
    });
    res.status(500).json({ 
      error: 'Failed to fetch devices',
      details: error.message 
    });
  }
});

// Generate report based on type
router.get('/generate', async (req, res) => {
  try {
    const { reportType, startDate, endDate, frequency, deviceIds, format } = req.query;

    console.log('📊 Generating report:', {
      reportType,
      startDate,
      endDate,
      frequency,
      deviceIds,
      format
    });

    if (!reportType || !startDate) {
      return res.status(400).json({ error: 'Report type and start date are required' });
    }

    // Get stored procedure name
    const procedureName = REPORT_PROCEDURES[reportType];
    if (!procedureName) {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    // Parse device IDs if provided
    let deviceIdString = null;
    if (deviceIds) {
      try {
        const parsedIds = JSON.parse(deviceIds);
        if (Array.isArray(parsedIds) && parsedIds.length > 0) {
          deviceIdString = parsedIds.join(',');
          console.log('✅ Device IDs parsed:', deviceIdString);
        }
      } catch (e) {
        console.error('❌ Error parsing device IDs:', e);
      }
    }

    const pool = req.app.locals.db;
    const request = pool.request();

    // Add common parameters
    request.input('DEC_DATE', sql.Date, startDate);
    
    // Add end date if provided
    if (endDate) {
      request.input('DEC_DATE1', sql.Date, endDate);
    }

    // Add frequency if provided
    if (frequency) {
      request.input('FREQUENCY', sql.Int, parseInt(frequency));
    }

    // Add device IDs if provided
    if (deviceIdString) {
      request.input('DEVICE_IDS', sql.NVarChar, deviceIdString);
    }

    console.log('🔄 Executing stored procedure:', procedureName);

    // Execute stored procedure
    const result = await request.execute(procedureName);
    const data = result.recordset;

    console.log('✅ Data retrieved:', data.length, 'rows');

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified criteria' });
    }

    // Generate file based on format
    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${getFileName(reportType, startDate, endDate, 'csv')}`);
      res.send(csv);
    } else if (format === 'xlsx') {
      const excel = await convertToExcel(data, reportType);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${getFileName(reportType, startDate, endDate, 'xlsx')}`);
      res.send(excel);
    } else {
      res.status(400).json({ error: 'Invalid format. Use csv or xlsx' });
    }

  } catch (error) {
    console.error('❌ Error generating report:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      state: error.state
    });
    res.status(500).json({ 
      error: 'Failed to generate report', 
      details: error.message 
    });
  }
});

// Helper: Generate filename
function getFileName(reportType, startDate, endDate, extension) {
  const reportNames = {
    fn_report_inverter: 'Inverter_Report',
    fn_report_mfm: 'MFM_Report',
    fn_report_smb: 'SMB_Report',
    fn_report_trafo: 'Trafo_Report',
    fn_report_wms: 'WMS_Report',
    fn_report_dgr: 'DGR_Report',
    fn_report_alarms: 'Alarms_Report',
  };

  const reportName = reportNames[reportType] || 'Report';
  
  if (endDate) {
    return `${reportName}_${startDate}_to_${endDate}.${extension}`;
  } else {
    return `${reportName}_${startDate}.${extension}`;
  }
}

// Helper: Convert to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(val => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'string') {
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          return `"${val.replace(/"/g, '""')}"`;
        }
      }
      return val;
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

// Helper: Convert to Excel
async function convertToExcel(data, reportType) {
  const workbook = new ExcelJS.Workbook();
  
  const sheetNames = {
    fn_report_inverter: 'Inverter Report',
    fn_report_mfm: 'MFM Report',
    fn_report_smb: 'SMB Report',
    fn_report_trafo: 'Transformer Report',
    fn_report_wms: 'WMS Report',
    fn_report_dgr: 'DGR Report',
    fn_report_alarms: 'Alarms Report',
  };
  
  const sheetName = sheetNames[reportType] || 'Report';
  const worksheet = workbook.addWorksheet(sheetName);
  
  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key.replace(/_/g, ' ').toUpperCase(),
      key: key,
      width: 15
    }));
    
    data.forEach(row => worksheet.addRow(row));
    
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3498db' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 20;
    
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellLength = cell.value ? cell.value.toString().length : 10;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });
  }
  
  return await workbook.xlsx.writeBuffer();
}

module.exports = router;
