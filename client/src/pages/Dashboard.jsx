import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import {
  Zap,
  Leaf,
  Users,
  Building,
  Calendar,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({ setActiveTab, onOpenNewBooking, onSelectBuilding, onSelectRoom }) {
  const { metrics, rooms, alerts, bulkRoomControl } = useCampus();
  const { user, role } = useAuth();
  const [ecoActionLoading, setEcoActionLoading] = useState(false);

  if (!metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto" />
          <span className="text-sm font-medium text-gray-500">Loading campus metrics...</span>
        </div>
      </div>
    );
  }

  // Quick Action Handler for Eco Mode
  const handleCampusEcoShutdown = async () => {
    setEcoActionLoading(true);
    try {
      const emptyRooms = rooms.filter(r => r.current_occupancy === 0);
      for (const r of emptyRooms) {
        await bulkRoomControl(r.id, 'all_off');
      }
    } finally {
      setEcoActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              Campus Operations
            </span>
            <span className="text-xs text-gray-500">Oakridge Institute of Technology</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Welcome, {user?.name || 'Administrator'}
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Real-time energy telemetry and automated resource management across 4 academic blocks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {role === 'admin' && (
            <button
              onClick={handleCampusEcoShutdown}
              disabled={ecoActionLoading}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Leaf className="h-4 w-4" />
              <span>{ecoActionLoading ? 'Applying...' : 'Enforce Eco-Rules'}</span>
            </button>
          )}

          {(role === 'faculty' || role === 'student') && (
            <button
              onClick={onOpenNewBooking}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>New Reservation</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('devices')}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>Device Controls</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Four Clean Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Power Usage */}
        <StatCard
          title="Power Usage"
          value={metrics.livePowerKw}
          unit="kW"
          subtitle={`${metrics.activeDevices} of ${metrics.totalDevices} devices on`}
          icon={Zap}
          trend="-14.2% vs target"
          trendPositive={true}
        />

        {/* Card 2: Energy Saved */}
        <StatCard
          title="Energy Saved"
          value={metrics.energySavedKwh}
          unit="kWh"
          subtitle={`$${metrics.costSavedUsd} saved today`}
          icon={Leaf}
          trend="+22.8% conserved"
          trendPositive={true}
        />

        {/* Card 3: Carbon Emissions */}
        <StatCard
          title="Carbon Emissions"
          value={metrics.carbonRateKgPerHour}
          unit="kg CO₂/h"
          subtitle={`Today: ${metrics.todayCarbonKg} kg total`}
          icon={TrendingDown}
          trend="Factor: 0.82"
          trendPositive={true}
        />

        {/* Card 4: Campus Occupancy */}
        <StatCard
          title="Campus Occupancy"
          value={metrics.totalOccupants}
          unit={`/ ${metrics.totalCapacity} pax`}
          subtitle={`${metrics.activeRooms} of ${metrics.totalRooms} rooms occupied`}
          icon={Users}
          trend="PIR Simulated"
          trendPositive={true}
        />
      </div>

      {/* Simple Energy Chart and Equipment Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Simple Energy Consumption Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">24-Hour Energy Consumption (kW)</h2>
              <p className="text-xs text-gray-500">Hourly diurnal electricity demand profile with rooftop solar generation</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Total Load
              </span>
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Solar Generation
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.hourlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotalLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorSolarLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="time" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} unit=" kW" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '0.5rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ color: '#374151', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="totalKw" name="Grid Demand" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorTotalLight)" />
                <Area type="monotone" dataKey="solarGenerationKw" name="Solar Gen" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorSolarLight)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clean Device Breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 pb-1">Load by Equipment</h2>
            <p className="text-xs text-gray-500 pb-3 border-b border-gray-100">Power draw distribution across device types</p>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {metrics.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} kW`, 'Draw']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '0.5rem', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100 text-xs">
            {metrics.byCategory.map(c => (
              <div key={c.name} className="flex items-center justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.fill }} />
                  {c.name}
                </span>
                <span className="font-semibold text-gray-900">{c.value} kW</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Organized Campus Status Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building className="h-5 w-5 text-emerald-700" />
              <span>Campus Buildings Status</span>
            </h2>
            <p className="text-xs text-gray-500">Live energy consumption and room occupancy across campus complexes</p>
          </div>
          <button
            onClick={() => setActiveTab('devices')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Manage Rooms & Devices <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4">
          {metrics.buildingBreakdown.map(b => (
            <div
              key={b.id}
              onClick={() => onSelectBuilding && onSelectBuilding(b)}
              className="border border-gray-200 rounded-xl p-4 hover:border-emerald-600 hover:bg-gray-50 transition-all cursor-pointer group"
              title="Click to view building details"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {b.code}
                  </span>
                  <h3 className="mt-1.5 text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {b.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-gray-900">{b.powerKw}</span>
                  <span className="text-xs text-gray-500 ml-1">kW</span>
                </div>
              </div>

              {/* Occupancy bar */}
              <div className="mt-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Occupancy</span>
                  <span className="font-medium text-gray-700">{b.occupants} / {b.capacity} ({b.occupancyPercent}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${Math.min(100, b.occupancyPercent)}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 pt-2.5 border-t border-gray-100">
                <span>Active Rooms</span>
                <span className="font-semibold text-gray-700">{b.activeRooms} of {b.totalRooms}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Recent Grid & System Alerts</h2>
          <button
            onClick={() => setActiveTab('alerts')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View All ({alerts.length})
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {alerts.slice(0, 3).map(a => (
            <div key={a.id} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                  a.severity === 'high' ? 'bg-rose-600' : a.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-600'
                }`} />
                <div>
                  <p className="text-gray-900 font-medium">{a.message}</p>
                  <p className="text-gray-500 mt-0.5">
                    {a.room_name || 'General Campus'} • {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase shrink-0 ${
                a.is_resolved
                  ? 'bg-gray-100 text-gray-600'
                  : a.severity === 'high'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {a.is_resolved ? 'Resolved' : a.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
