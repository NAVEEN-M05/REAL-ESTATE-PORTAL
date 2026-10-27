import React from 'react';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

export default function TopNavigationBar({ history, currentStep, onBack, onHome }) {
  const canGoBack = history && history.length > 1;
  const previousStep = canGoBack ? history[history.length - 2] : null;

  const getPageTitle = (step) => {
    if (!step) return 'Dashboard';
    switch (step.tab) {
      case 'dashboard': return 'Dashboard';
      case 'energy': return 'Energy Monitoring';
      case 'devices': return 'Device Control';
      case 'bookings': return 'Room Booking';
      case 'alerts': return 'Alerts';
      case 'reports': return 'Reports';
      case 'building-detail': return step.params?.name || 'Building Details';
      case 'room-detail': return step.params?.name || 'Room Details';
      case 'profile': return 'Admin Profile';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
      {/* Top Left Navigation Arrow Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
            canGoBack
              ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 shadow-sm active:scale-95'
              : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
          }`}
          title={canGoBack ? `Go back to ${getPageTitle(previousStep)}` : 'No previous page'}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
          {previousStep && (
            <span className="hidden md:inline text-[11px] font-normal text-gray-500 border-l border-gray-300 pl-2">
              to {getPageTitle(previousStep)}
            </span>
          )}
        </button>

        {/* Home shortcut */}
        <button
          onClick={onHome}
          className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors"
          title="Return to Dashboard"
        >
          <Home className="h-4 w-4" />
        </button>

        {/* Clean Breadcrumb Trail */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 pl-2">
          <span className="hover:text-gray-900 cursor-pointer" onClick={onHome}>Smart Campus</span>
          <ChevronRight className="h-3 w-3 text-gray-400" />
          <span className="font-semibold text-gray-900">{getPageTitle(currentStep)}</span>
          {currentStep?.params?.code && (
            <>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium">
                {currentStep.params.code}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
