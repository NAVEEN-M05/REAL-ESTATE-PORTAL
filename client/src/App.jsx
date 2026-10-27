import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CampusProvider, useCampus } from './context/CampusContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TopNavigationBar from './components/TopNavigationBar';
import Dashboard from './pages/Dashboard';
import EnergyMonitoring from './pages/EnergyMonitoring';
import DeviceControl from './pages/DeviceControl';
import RoomBooking from './pages/RoomBooking';
import AlertsCenter from './pages/AlertsCenter';
import ReportsAnalytics from './pages/ReportsAnalytics';
import BuildingDetail from './pages/BuildingDetail';
import RoomDetail from './pages/RoomDetail';
import ProfileSettings from './pages/ProfileSettings';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

function CampusAppContent() {
  const [navHistory, setNavHistory] = useState([
    { tab: 'dashboard', params: null }
  ]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { toasts } = useCampus();

  const currentStep = navHistory[navHistory.length - 1] || { tab: 'dashboard', params: null };
  const activeTab = currentStep.tab;

  const navigateTo = (tab, params = null) => {
    if (tab === activeTab && !params) return;
    setNavHistory(prev => [...prev, { tab, params }]);
  };

  const handleTabChange = (tab) => {
    setNavHistory(prev => [...prev, { tab, params: null }]);
  };

  const handleGoBack = () => {
    if (navHistory.length > 1) {
      setNavHistory(prev => prev.slice(0, -1));
    }
  };

  const handleGoHome = () => {
    setNavHistory([{ tab: 'dashboard', params: null }]);
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            setActiveTab={handleTabChange}
            onOpenNewBooking={() => {
              handleTabChange('bookings');
              setIsBookingModalOpen(true);
            }}
            onSelectBuilding={(bldg) => navigateTo('building-detail', bldg)}
            onSelectRoom={(rm) => navigateTo('room-detail', rm)}
          />
        );
      case 'energy':
        return (
          <EnergyMonitoring
            onSelectBuilding={(bldg) => navigateTo('building-detail', bldg)}
          />
        );
      case 'devices':
        return (
          <DeviceControl
            onSelectRoom={(rm) => navigateTo('room-detail', rm)}
          />
        );
      case 'bookings':
        return (
          <RoomBooking
            isModalOpen={isBookingModalOpen}
            setIsModalOpen={setIsBookingModalOpen}
            onSelectRoom={(rm) => navigateTo('room-detail', rm)}
          />
        );
      case 'alerts':
        return <AlertsCenter />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'building-detail':
        return (
          <BuildingDetail
            building={currentStep.params}
            onBack={handleGoBack}
            onSelectRoom={(rm) => navigateTo('room-detail', rm)}
          />
        );
      case 'room-detail':
        return (
          <RoomDetail
            room={currentStep.params}
            onBack={handleGoBack}
          />
        );
      case 'profile':
        return (
          <ProfileSettings
            onBack={handleGoBack}
          />
        );
      default:
        return <Dashboard setActiveTab={handleTabChange} onOpenNewBooking={() => setIsBookingModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar
        onOpenAlerts={() => handleTabChange('alerts')}
        onOpenProfile={() => navigateTo('profile')}
        setActiveTab={handleTabChange}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onOpenProfile={() => navigateTo('profile')}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            {/* Top Navigation Arrow Bar & Breadcrumbs */}
            <TopNavigationBar
              history={navHistory}
              currentStep={currentStep}
              onBack={handleGoBack}
              onHome={handleGoHome}
            />

            {/* Content view */}
            {renderActivePage()}
          </div>
        </main>
      </div>

      {/* Clean Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-xs shadow-lg transition-all duration-200 animate-slide-in ${
              toast.type === 'error'
                ? 'border-rose-200 bg-white text-rose-800 shadow-rose-100'
                : toast.type === 'warning'
                ? 'border-amber-200 bg-white text-amber-800 shadow-amber-100'
                : 'border-emerald-200 bg-white text-emerald-800 shadow-emerald-100'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-semibold text-gray-800">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusProvider>
        <CampusAppContent />
      </CampusProvider>
    </AuthProvider>
  );
}
