import React from 'react';
import {
  LayoutDashboard,
  Gauge,
  Sliders,
  CalendarCheck,
  AlertTriangle,
  FileBarChart2,
  User
} from 'lucide-react';
import { useCampus } from '../context/CampusContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, onOpenProfile }) {
  const { alerts, metrics } = useCampus();
  const { role, user } = useAuth();

  const unresolvedAlerts = alerts.filter(a => !a.is_resolved).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'energy', label: 'Energy Monitoring', icon: Gauge },
    { id: 'devices', label: 'Device Control', icon: Sliders },
    { id: 'bookings', label: 'Room Booking', icon: CalendarCheck, badge: metrics?.pendingBookings > 0 ? `${metrics.pendingBookings}` : null },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: unresolvedAlerts > 0 ? `${unresolvedAlerts}` : null },
    { id: 'reports', label: 'Reports', icon: FileBarChart2 }
  ];

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col justify-between p-4 hidden md:flex">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold border-l-4 border-emerald-600 pl-2.5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-700' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile button at bottom */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
          title="Edit Profile & Settings"
        >
          <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-gray-900 truncate">{user?.name || 'Administrator'}</div>
            <div className="text-[11px] text-gray-500 capitalize">{role} • Settings</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
