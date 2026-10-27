import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CampusContext = createContext(null);

export function CampusProvider({ children }) {
  const [metrics, setMetrics] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [toasts, setToasts] = useState([]);

  // Toast notification dispatcher
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  // Fetch all primary dataset
  const fetchData = useCallback(async () => {
    try {
      const [m, r, d, b, a] = await Promise.all([
        api.energy.getLiveMetrics(),
        api.rooms.getAll(),
        api.devices.getAll(),
        api.bookings.getAll(),
        api.alerts.getAll()
      ]);

      setMetrics(m);
      setRooms(r);
      setDevices(d);
      setBookings(b);
      setAlerts(a);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Campus telemetry polling error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time polling timer (every 4 seconds)
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      fetchData();
    }, 4000);
    return () => clearInterval(timer);
  }, [isLive, fetchData]);

  // Actions
  const toggleDevice = async (deviceId, status) => {
    try {
      const res = await api.devices.toggle(deviceId, status);
      addToast(res.message, 'success');
      await fetchData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const bulkRoomControl = async (roomId, action) => {
    try {
      const res = await api.devices.bulkControl(roomId, action);
      addToast(res.message, 'success');
      await fetchData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateOccupancy = async (roomId, occupancy) => {
    try {
      const res = await api.rooms.updateOccupancy(roomId, occupancy);
      addToast(res.message, 'info');
      await fetchData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const toggleAutoControl = async (roomId, enabled) => {
    try {
      const res = await api.rooms.toggleAutoControl(roomId, enabled);
      addToast(res.message, 'info');
      await fetchData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const res = await api.bookings.create(bookingData);
      addToast(res.message, 'success');
      await fetchData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const res = await api.bookings.updateStatus(bookingId, status);
      addToast(res.message, 'info');
      await fetchData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      const res = await api.alerts.resolve(alertId);
      addToast('Alert resolved', 'success');
      await fetchData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  const triggerTestAlert = async (alertData) => {
    try {
      const res = await api.alerts.triggerTest(alertData);
      addToast('Simulation alert triggered!', 'warning');
      await fetchData();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    }
  };

  return (
    <CampusContext.Provider
      value={{
        metrics,
        rooms,
        devices,
        bookings,
        alerts,
        report,
        loading,
        isLive,
        setIsLive,
        lastUpdated,
        toasts,
        addToast,
        refresh: fetchData,
        toggleDevice,
        bulkRoomControl,
        updateOccupancy,
        toggleAutoControl,
        createBooking,
        updateBookingStatus,
        resolveAlert,
        triggerTestAlert
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
}
