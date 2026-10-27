import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Gauge,
  Activity,
  Zap,
  TrendingDown,
  TreePine,
  BarChart3,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function EnergyMonitoring({ onSelectBuilding }) {
  const { metrics, isLive } = useCampus();

  if (!metrics) {
    return <div className="p-8 text-center text-gray-500">Loading energy telemetry...</div>;
  }

  // Calculate environmental equivalents
  const treesEquivalent = +(metrics.todayCarbonKg / 0.06).toFixed(0);

  // Peak and Min stats from realtime stream
  const currentStreamValues = metrics.realtimeStream.map(s => s.kw);
  const maxKw = currentStreamValues.length ? Math.max(...currentStreamValues).toFixed(1) : metrics.livePowerKw;
  const minKw = currentStreamValues.length ? Math.min(...currentStreamValues).toFixed(1) : metrics.livePowerKw;
  const avgKw = currentStreamValues.length
    ? (currentStreamValues.reduce((a, b) => a + b, 0) / currentStreamValues.length).toFixed(1)
    : metrics.livePowerKw;

  // Building comparison data
  const buildingComparisonData = metrics.buildingBreakdown.map(b => ({
    name: b.code,
    fullName: b.name,
    actualKw: b.powerKw,
    targetKw: +(b.carbonTarget / 24).toFixed(1)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gauge className="h-6 w-6 text-emerald-700" />
            <span>Energy Monitoring</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Real-time power quality, load balance, and environmental sustainability telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            <Activity className={`h-4 w-4 ${isLive ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span>Sampling: <strong className="text-gray-900 font-semibold">4s Interval</strong></span>
          </div>
        </div>
      </div>

      {/* Real-Time Demand Graph */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Real-Time Grid Demand (Last 30 Readings)</h2>
            <p className="text-xs text-gray-500">Live power draw simulated from active campus equipment</p>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>Min: <strong className="text-gray-900">{minKw} kW</strong></span>
            <span className="text-gray-300">|</span>
            <span>Avg: <strong className="text-emerald-700">{avgKw} kW</strong></span>
            <span className="text-gray-300">|</span>
            <span>Peak: <strong className="text-amber-700">{maxKw} kW</strong></span>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.realtimeStream} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} domain={['dataMin - 5', 'dataMax + 5']} unit=" kW" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '0.5rem', fontSize: '12px' }}
                labelStyle={{ color: '#374151' }}
              />
              <Line
                type="monotone"
                dataKey="kw"
                name="Demand (kW)"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Building Comparison & Sustainability Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Building Actual vs Target Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="pb-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-700" />
              <span>Building Power vs Hourly Target Budget</span>
            </h2>
            <p className="text-xs text-gray-500">Comparison of current building draw against rated budget</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} unit=" kW" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '0.5rem', fontSize: '12px' }}
                  labelStyle={{ color: '#374151' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="actualKw" name="Actual Draw (kW)" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="targetKw" name="Target Budget (kW)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental Indicators */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TreePine className="h-4 w-4 text-emerald-700" />
                  <span>Sustainability & Tariffs</span>
                </h2>
                <p className="text-xs text-gray-500">Environmental factors and operating utility costs</p>
              </div>

              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Score: 94/100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-500">Carbon Intensity</span>
                <div className="mt-1 text-xl font-bold text-gray-900">
                  {metrics.carbonRateKgPerHour} <span className="text-xs font-normal text-gray-500">kg/h</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Grid factor: 0.82 kg CO₂/kWh</p>
              </div>

              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-500">Hourly Operating Tariff</span>
                <div className="mt-1 text-xl font-bold text-gray-900">
                  ${metrics.costRatePerHour} <span className="text-xs font-normal text-gray-500">/hr</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Institutional tariff @ $0.14/kWh</p>
              </div>

              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-500">Avoided Emissions</span>
                <div className="mt-1 text-xl font-bold text-emerald-700">
                  {+(metrics.energySavedKwh * 0.82).toFixed(1)} <span className="text-xs font-normal text-gray-500">kg CO₂</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Saved via automated controls</p>
              </div>

              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-500">Trees Offset Equivalent</span>
                <div className="mt-1 text-xl font-bold text-emerald-700">
                  {treesEquivalent} <span className="text-xs font-normal text-gray-500">trees</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Annual carbon sequestration</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 flex items-start gap-2.5">
            <Info className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
            <div>
              <strong>Peak Advisory (11:00 - 15:00):</strong> Automated AC setback and staggered workstation power prevents ~18% peak utility penalty.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
