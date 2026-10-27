import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  Leaf,
  Flame,
  Search
} from 'lucide-react';

export default function AlertsCenter() {
  const { alerts, resolveAlert, triggerTestAlert } = useCampus();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('unresolved');
  const [searchQuery, setSearchQuery] = useState('');
  const [injecting, setInjecting] = useState(false);

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterStatus === 'unresolved' && a.is_resolved) return false;
    if (filterStatus === 'resolved' && !a.is_resolved) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.message.toLowerCase().includes(q) || (a.room_name && a.room_name.toLowerCase().includes(q));
    }
    return true;
  });

  const handleSimulateAlert = async (type) => {
    setInjecting(true);
    try {
      if (type === 'spike') {
        await triggerTestAlert({
          room_id: 6,
          type: 'energy_spike',
          message: 'CAD Simulation Center (KET-205) power draw exceeded 6.8 kW limit during heavy parallel computing workload.',
          severity: 'high'
        });
      } else if (type === 'unoccupied') {
        await triggerTestAlert({
          room_id: 7,
          type: 'unoccupied_waste',
          message: 'Engineering Classroom 302 unoccupied for 15+ minutes with illumination & HVAC active. Auto-eco agent dispatched.',
          severity: 'medium'
        });
      } else {
        await triggerTestAlert({
          room_id: 1,
          type: 'device_fault',
          message: 'Robotics Lab dual inverter AC reporting compressor oscillation above expected harmonic tolerance.',
          severity: 'medium'
        });
      }
    } finally {
      setInjecting(false);
    }
  };

  const getAlertIcon = (type, severity) => {
    if (type === 'energy_spike') return Zap;
    if (type === 'eco_saving') return Leaf;
    if (severity === 'high' || severity === 'critical') return Flame;
    return AlertTriangle;
  };

  const activeCount = alerts.filter(a => !a.is_resolved).length;
  const resolvedCount = alerts.filter(a => a.is_resolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <span>Alerts & Grid Anomalies</span>
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            Real-time incident detection, energy waste alarms, and equipment fault notifications.
          </p>
        </div>

        {/* Test event injectors */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 hidden sm:inline">Simulate Event:</span>
          <button
            onClick={() => handleSimulateAlert('spike')}
            disabled={injecting}
            className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 transition-colors"
          >
            + Power Spike
          </button>
          <button
            onClick={() => handleSimulateAlert('unoccupied')}
            disabled={injecting}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
          >
            + Idle Room Waste
          </button>
        </div>
      </div>

      {/* Summary Scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Alarms</span>
          <div className="mt-1 text-2xl font-bold text-rose-700">{activeCount}</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Require operational attention</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved Alarms</span>
          <div className="mt-1 text-2xl font-bold text-emerald-700">{resolvedCount}</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Mitigated by auto-rules or operator</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Response Time</span>
          <div className="mt-1 text-2xl font-bold text-gray-900">4.2s</div>
          <p className="text-[11px] text-gray-500 mt-0.5">Automated software execution</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident logs..."
            className="rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none w-52"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-emerald-600 focus:outline-none"
        >
          <option value="unresolved">Active / Unresolved Only</option>
          <option value="resolved">Resolved History</option>
          <option value="all">All Alerts</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-emerald-600 focus:outline-none"
        >
          <option value="all">All Severities</option>
          <option value="high">High Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="low">Low (Eco-Notices)</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 mb-2" />
            <p className="text-sm font-semibold text-gray-900">All Nominal</p>
            <p className="text-xs text-gray-500 mt-1">
              Campus equipment and simulated sensors are operating within normal thresholds.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const Icon = getAlertIcon(alert.type, alert.severity);
            const isHigh = alert.severity === 'high';
            const isMedium = alert.severity === 'medium';

            return (
              <div
                key={alert.id}
                className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
                  alert.is_resolved
                    ? 'border-gray-200 opacity-60'
                    : isHigh
                    ? 'border-rose-300 bg-rose-50/20'
                    : isMedium
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-emerald-200 bg-emerald-50/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      isHigh
                        ? 'bg-rose-100 text-rose-700'
                        : isMedium
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        {alert.room_name || 'General Campus'}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm text-gray-800 font-medium">{alert.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {!alert.is_resolved ? (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="rounded-lg bg-white border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
