import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  FileBarChart2,
  Download,
  Printer,
  Award,
  CheckCircle,
  Leaf,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function ReportsAnalytics() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports.getEnergyReport()
      .then(data => setReport(data))
      .catch(err => console.error('Failed to load report:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadCSV = () => {
    window.open('/api/reports/export-csv', '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="p-12 text-center text-gray-500">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto mb-2" />
        <span className="text-sm font-medium">Generating energy report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart2 className="h-6 w-6 text-emerald-700" />
            <span>Energy-Saving Reports & Audits</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Institutional energy conservation audit, department efficiency ratings, and downloadable data.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Leaf className="h-4 w-4 text-emerald-600" /> Weekly Conserved Energy
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {report.summary.totalWeeklySavedKwh.toLocaleString()} <span className="text-sm font-normal text-gray-500">kWh</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Prevented {report.summary.totalWeeklyCarbonReduced} kg CO₂ emissions</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <DollarSign className="h-4 w-4 text-emerald-600" /> Financial Utility Savings
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            ${report.summary.totalWeeklyCostSaved.toFixed(2)}
          </div>
          <p className="mt-1 text-xs text-gray-500">Calculated under standard rate schedule @ $0.14/kWh</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Award className="h-4 w-4 text-emerald-600" /> Campus Efficiency Index
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {report.summary.campusEfficiencyIndex}
          </div>
          <p className="mt-1 text-xs text-gray-500">{report.summary.automatedActionsExecuted} automated load optimizations</p>
        </div>
      </div>

      {/* Weekly Actual vs Baseline Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Weekly Consumption vs Baseline (kWh)</h2>
          <p className="text-xs text-gray-500">Daily energy profile comparing unmanaged baseline against auto-controlled load</p>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={report.weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} unit=" kWh" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '0.5rem', fontSize: '12px' }}
                labelStyle={{ color: '#374151' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="baselineKwh" name="Unmanaged Baseline (kWh)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actualKwh" name="Actual Managed (kWh)" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="savedKwh" name="Conserved (kWh)" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Efficiency Ratings Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-700" />
            <span>Department Efficiency Leaderboard</span>
          </h2>
          <p className="text-xs text-gray-500">Institutional ratings based on automated energy compliance</p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Rank & Department</th>
                <th className="pb-3 px-3">Actual Draw</th>
                <th className="pb-3 px-3">Target Budget</th>
                <th className="pb-3 px-3">Saved (kWh)</th>
                <th className="pb-3 px-3">Carbon Reduced</th>
                <th className="pb-3 px-3">Score & Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.departmentMetrics.map((dept, idx) => (
                <tr key={dept.department} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-gray-900 flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold bg-gray-100 text-gray-700">
                      {idx + 1}
                    </span>
                    <span>{dept.department}</span>
                  </td>
                  <td className="py-3 px-3 text-gray-700">{dept.energyKwh} kWh</td>
                  <td className="py-3 px-3 text-gray-500">{dept.targetKwh} kWh</td>
                  <td className="py-3 px-3 font-semibold text-emerald-700">+{dept.savedKwh} kWh</td>
                  <td className="py-3 px-3 text-gray-700">{dept.carbonReducedKg} kg</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{dept.score}/100</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {dept.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 pb-3 border-b border-gray-100">Smart Campus Recommendations</h2>
        <div className="mt-3 space-y-2">
          {report.ecoRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
