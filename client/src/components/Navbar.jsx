import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCampus } from '../context/CampusContext';
import {
  Zap,
  Bell,
  RefreshCw,
  Pause,
  Play
} from 'lucide-react';

export default function Navbar({ onOpenAlerts, onOpenProfile, setActiveTab }) {
  const { user, role, switchRole } = useAuth();
  const { isLive, setIsLive, alerts, refresh } = useCampus();

  const unresolvedAlertsCount = alerts.filter(a => !a.is_resolved).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      {/* Brand title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 leading-tight block">
              Smart Campus <span className="text-emerald-700 font-semibold">Energy</span>
            </span>
            <span className="text-[11px] text-gray-500 block">Resource Management System</span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Simulation Toggle */}
        <button
          onClick={() => setIsLive(!isLive)}
          title={isLive ? 'Pause simulation updates' : 'Resume simulation updates'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-colors ${
            isLive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-amber-200 bg-amber-50 text-amber-800'
          }`}
        >
          {isLive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isLive ? 'Simulation Active' : 'Paused'}</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={refresh}
          title="Refresh Data"
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Notifications / Alerts trigger */}
        <button
          onClick={onOpenAlerts}
          className="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          title="View Alerts"
        >
          <Bell className="h-4 w-4" />
          {unresolvedAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {unresolvedAlertsCount}
            </span>
          )}
        </button>

        {/* Role Switcher */}
        <div className="flex items-center rounded-lg bg-gray-100 p-1 border border-gray-200 text-xs">
          <span className="text-[11px] font-medium text-gray-500 px-2 hidden sm:inline">Role:</span>
          
          <button
            onClick={() => switchRole('admin')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              role === 'admin'
                ? 'bg-white text-gray-900 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin
          </button>

          <button
            onClick={() => switchRole('faculty')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              role === 'faculty'
                ? 'bg-white text-gray-900 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Faculty
          </button>

          <button
            onClick={() => switchRole('student')}
            className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
              role === 'student'
                ? 'bg-white text-gray-900 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Student
          </button>
        </div>

        {/* User Profile Button */}
        {user && (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 border-l border-gray-200 text-left hover:opacity-80 transition-opacity"
            title="Edit Profile & Settings"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className="font-semibold text-gray-900 truncate max-w-[120px]">{user.name}</div>
              <div className="text-[11px] text-gray-500 capitalize">{user.role}</div>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}
