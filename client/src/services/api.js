const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('smart_campus_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  if (!res.ok) {
    let errMessage = 'Network request failed';
    try {
      const data = await res.json();
      errMessage = data.error || data.message || errMessage;
    } catch (e) {
      // not JSON
    }
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // Auth
  auth: {
    login: (email, password) =>
      fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).then(handleResponse),

    demoLogin: (role) =>
      fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      }).then(handleResponse),

    register: (userData) =>
      fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }).then(handleResponse),

    getMe: () =>
      fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      }).then(handleResponse),

    updateProfile: (profileData) =>
      fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      }).then(handleResponse)
  },

  // Energy & Telemetry
  energy: {
    getLiveMetrics: () =>
      fetch(`${API_BASE}/energy/metrics`, {
        headers: getAuthHeaders()
      }).then(handleResponse),

    getBuildingAnalytics: (buildingId) =>
      fetch(`${API_BASE}/energy/building/${buildingId}`, {
        headers: getAuthHeaders()
      }).then(handleResponse)
  },

  // Rooms
  rooms: {
    getAll: () =>
      fetch(`${API_BASE}/rooms`, {
        headers: getAuthHeaders()
      }).then(handleResponse),

    updateOccupancy: (roomId, occupancy) =>
      fetch(`${API_BASE}/rooms/${roomId}/occupancy`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ occupancy })
      }).then(handleResponse),

    toggleAutoControl: (roomId, enabled) =>
      fetch(`${API_BASE}/rooms/${roomId}/auto-control`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ enabled })
      }).then(handleResponse)
  },

  // Devices
  devices: {
    getAll: () =>
      fetch(`${API_BASE}/devices`, {
        headers: getAuthHeaders()
      }).then(handleResponse),

    toggle: (deviceId, status) =>
      fetch(`${API_BASE}/devices/${deviceId}/toggle`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      }).then(handleResponse),

    bulkControl: (roomId, action) =>
      fetch(`${API_BASE}/devices/room/${roomId}/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      }).then(handleResponse)
  },

  // Bookings
  bookings: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/bookings${q ? `?${q}` : ''}`, {
        headers: getAuthHeaders()
      }).then(handleResponse);
    },

    create: (bookingData) =>
      fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData)
      }).then(handleResponse),

    updateStatus: (bookingId, status) =>
      fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      }).then(handleResponse)
  },

  // Alerts
  alerts: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return fetch(`${API_BASE}/alerts${q ? `?${q}` : ''}`, {
        headers: getAuthHeaders()
      }).then(handleResponse);
    },

    resolve: (alertId) =>
      fetch(`${API_BASE}/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders()
      }).then(handleResponse),

    triggerTest: (alertData) =>
      fetch(`${API_BASE}/alerts/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(alertData)
      }).then(handleResponse)
  },

  // Reports
  reports: {
    getEnergyReport: () =>
      fetch(`${API_BASE}/reports/energy`, {
        headers: getAuthHeaders()
      }).then(handleResponse),

    exportCsvUrl: () => `${API_BASE}/reports/export-csv`
  }
};
