const db = require('../config/db');

async function getEnergyReport(req, res) {
  try {
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    // Department rankings & efficiency scores
    const departmentMetrics = [
      { department: 'Computer Science & AI', energyKwh: 4120.5, targetKwh: 4500.0, savedKwh: 890.2, score: 92, status: 'Excellent', carbonReducedKg: 730.0 },
      { department: 'Mechanical & CAD Studio', energyKwh: 5310.0, targetKwh: 5200.0, savedKwh: 640.5, score: 84, status: 'Good', carbonReducedKg: 525.2 },
      { department: 'Electrical & Embedded', energyKwh: 3890.2, targetKwh: 4200.0, savedKwh: 710.0, score: 89, status: 'Very Good', carbonReducedKg: 582.2 },
      { department: 'Central Library & Admin', energyKwh: 2450.0, targetKwh: 3000.0, savedKwh: 680.4, score: 95, status: 'Optimal', carbonReducedKg: 557.9 },
      { department: 'Civil & Environmental', energyKwh: 1980.4, targetKwh: 2200.0, savedKwh: 320.1, score: 86, status: 'Good', carbonReducedKg: 262.5 }
    ];

    // Weekly comparison
    const weeklyData = [
      { day: 'Mon', baselineKwh: 1250, actualKwh: 980, savedKwh: 270, costSaved: 37.8 },
      { day: 'Tue', baselineKwh: 1320, actualKwh: 1040, savedKwh: 280, costSaved: 39.2 },
      { day: 'Wed', baselineKwh: 1410, actualKwh: 1090, savedKwh: 320, costSaved: 44.8 },
      { day: 'Thu', baselineKwh: 1380, actualKwh: 1060, savedKwh: 320, costSaved: 44.8 },
      { day: 'Fri', baselineKwh: 1290, actualKwh: 990, savedKwh: 300, costSaved: 42.0 },
      { day: 'Sat', baselineKwh: 650, actualKwh: 410, savedKwh: 240, costSaved: 33.6 },
      { day: 'Sun', baselineKwh: 480, actualKwh: 310, savedKwh: 170, costSaved: 23.8 }
    ];

    // Summary KPIs
    const totalWeeklySavedKwh = weeklyData.reduce((sum, d) => sum + d.savedKwh, 0);
    const totalWeeklyCostSaved = +(totalWeeklySavedKwh * 0.14).toFixed(2);
    const totalWeeklyCarbonReduced = +(totalWeeklySavedKwh * 0.82).toFixed(1);

    return res.json({
      reportingPeriod: 'Current Billing Cycle',
      generatedAt: new Date().toISOString(),
      summary: {
        totalWeeklySavedKwh,
        totalWeeklyCostSaved,
        totalWeeklyCarbonReduced,
        campusEfficiencyIndex: '89.4%',
        activeAutomationRules: 3,
        automatedActionsExecuted: 142
      },
      departmentMetrics,
      weeklyData,
      ecoRecommendations: [
        'Set CAD workstation auto-suspend after 20 minutes of render idling.',
        'Migrate Aryabhata Block floor 3 HVAC setpoint from 22°C to 24°C during 13:00 - 15:00 peak hours.',
        'Schedule weekend auditorium chiller pre-cooling only 30 minutes prior to authorized summit bookings.'
      ]
    });
  } catch (err) {
    console.error('Report generation error:', err);
    return res.status(500).json({ error: 'Failed to generate energy report' });
  }
}

async function exportCSV(req, res) {
  try {
    const csvRows = [
      'Day,Baseline_kWh,Actual_kWh,Saved_kWh,Cost_Saved_USD,CO2_Reduction_kg',
      'Monday,1250,980,270,37.80,221.4',
      'Tuesday,1320,1040,280,39.20,229.6',
      'Wednesday,1410,1090,320,44.80,262.4',
      'Thursday,1380,1060,320,44.80,262.4',
      'Friday,1290,990,300,42.00,246.0',
      'Saturday,650,410,240,33.60,196.8',
      'Sunday,480,310,170,23.80,139.4'
    ];

    const csvContent = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campus_energy_audit_report.csv"');
    return res.status(200).send(csvContent);
  } catch (err) {
    return res.status(500).json({ error: 'CSV export failed' });
  }
}

module.exports = {
  getEnergyReport,
  exportCSV
};
