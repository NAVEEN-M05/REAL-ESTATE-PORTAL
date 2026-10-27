const db = require('../config/db');

class CampusSimulationService {
  constructor() {
    this.intervalId = null;
    this.historyBuffer = []; // 24-hour hourly trend
    this.realtimeBuffer = []; // Last 30 real-time ticks
    this.initHistory();
  }

  // Pre-generate a 24-hour diurnal energy curve
  initHistory() {
    const hours = [
      { hour: '00:00', baseKw: 14.2 },
      { hour: '02:00', baseKw: 12.8 },
      { hour: '04:00', baseKw: 11.5 },
      { hour: '06:00', baseKw: 18.2 },
      { hour: '08:00', baseKw: 45.6 },
      { hour: '10:00', baseKw: 78.4 },
      { hour: '12:00', baseKw: 92.1 },
      { hour: '14:00', baseKw: 88.5 },
      { hour: '16:00', baseKw: 72.0 },
      { hour: '18:00', baseKw: 51.3 },
      { hour: '20:00', baseKw: 32.7 },
      { hour: '22:00', baseKw: 21.0 }
    ];

    this.historyBuffer = hours.map(h => ({
      time: h.hour,
      Aryabhata: +(h.baseKw * 0.38 + (Math.random() * 2 - 1)).toFixed(1),
      Kalam: +(h.baseKw * 0.35 + (Math.random() * 2 - 1)).toFixed(1),
      Library: +(h.baseKw * 0.17 + (Math.random() * 1 - 0.5)).toFixed(1),
      Auditorium: +(h.baseKw * 0.10 + (Math.random() * 1.5 - 0.5)).toFixed(1),
      totalKw: +(h.baseKw + (Math.random() * 3 - 1.5)).toFixed(1),
      solarGenerationKw: +(h.hour >= '08:00' && h.hour <= '16:00' ? (Math.sin((parseInt(h.hour) - 7) / 10 * Math.PI) * 35).toFixed(1) : 0)
    }));
  }

  start() {
    if (this.intervalId) return;
    console.log('⚡ [Simulation Engine] Automated Campus Telemetry & Control Loop active.');
    this.intervalId = setInterval(() => this.tick(), 4000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async tick() {
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    try {
      const rooms = isMem ? memoryStore.find('rooms') : (await db.query('SELECT * FROM rooms')).rows;
      const devices = isMem ? memoryStore.find('devices') : (await db.query('SELECT * FROM devices')).rows;
      const bookings = isMem ? memoryStore.find('bookings') : (await db.query('SELECT * FROM bookings')).rows;

      const now = new Date();

      // 1. Check for Active Bookings and occupancy adjustment
      for (const booking of bookings) {
        if (booking.status === 'approved') {
          const start = new Date(booking.start_time);
          const end = new Date(booking.end_time);
          if (now >= start && now <= end) {
            const room = rooms.find(r => r.id === booking.room_id);
            if (room && room.current_occupancy === 0) {
              // Populate room occupancy for active session
              const simulatedPax = Math.max(5, Math.floor(booking.attendees * 0.85));
              room.current_occupancy = simulatedPax;
              if (isMem) {
                memoryStore.update('rooms', r => r.id === room.id, { current_occupancy: simulatedPax });
              } else {
                await db.query('UPDATE rooms SET current_occupancy = $1 WHERE id = $2', [simulatedPax, room.id]);
              }
            }
          }
        }
      }

      // 2. Automated Smart Control Loop (Software Eco-Rule Engine)
      // If room occupancy is 0 and auto_control_enabled is TRUE, shut down lights and fans
      for (const room of rooms) {
        if (room.auto_control_enabled && room.current_occupancy === 0) {
          const roomDevices = devices.filter(d => d.room_id === room.id && d.auto_controlled && d.status === 'on');
          
          if (roomDevices.length > 0) {
            for (const dev of roomDevices) {
              dev.status = 'off';
              if (isMem) {
                memoryStore.update('devices', d => d.id === dev.id, { status: 'off' });
              } else {
                await db.query("UPDATE devices SET status = 'off' WHERE id = $1", [dev.id]);
              }
            }

            // Create energy saving alert log
            const alertMsg = `Auto-Eco System: Switched off ${roomDevices.length} idle device(s) (${roomDevices.map(d => d.name).join(', ')}) in ${room.name} (${room.code}) - zero occupancy detected.`;
            const alertObj = {
              room_id: room.id,
              building_id: room.building_id,
              type: 'eco_saving',
              message: alertMsg,
              severity: 'low',
              is_resolved: false,
              created_at: now.toISOString()
            };

            if (isMem) {
              // Check if recent alert already exists to prevent flood
              const recent = memoryStore.find('alerts', a => a.room_id === room.id && a.type === 'eco_saving');
              if (recent.length < 5) {
                memoryStore.insert('alerts', alertObj);
              }
            } else {
              await db.query(
                'INSERT INTO alerts (room_id, building_id, type, message, severity, is_resolved) VALUES ($1, $2, $3, $4, $5, $6)',
                [alertObj.room_id, alertObj.building_id, alertObj.type, alertObj.message, alertObj.severity, alertObj.is_resolved]
              );
            }
          }
        }
      }

      // 3. Calculate Live Campus Telemetry
      let totalWatts = 0;
      let activeDevicesCount = 0;
      const buildingPower = { 1: 0, 2: 0, 3: 0, 4: 0 };

      devices.forEach(d => {
        if (d.status === 'on') {
          activeDevicesCount++;
          // Add small random noise ±2% to simulate fluctuating load
          const jitter = 1 + (Math.random() * 0.04 - 0.02);
          const draw = d.power_watts * jitter;
          totalWatts += draw;

          const r = rooms.find(rm => rm.id === d.room_id);
          if (r && buildingPower[r.building_id] !== undefined) {
            buildingPower[r.building_id] += draw;
          }
        }
      });

      const totalKw = +(totalWatts / 1000).toFixed(2);
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Keep last 30 live readings for high-frequency chart
      this.realtimeBuffer.push({
        time: timestamp,
        kw: totalKw,
        activeDevices: activeDevicesCount
      });
      if (this.realtimeBuffer.length > 30) this.realtimeBuffer.shift();

    } catch (err) {
      console.error('Simulation tick error:', err.message);
    }
  }

  // Get aggregated stats for the dashboard
  async getMetrics() {
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    const rooms = isMem ? memoryStore.find('rooms') : (await db.query('SELECT * FROM rooms')).rows;
    const devices = isMem ? memoryStore.find('devices') : (await db.query('SELECT * FROM devices')).rows;
    const buildings = isMem ? memoryStore.find('buildings') : (await db.query('SELECT * FROM buildings')).rows;
    const bookings = isMem ? memoryStore.find('bookings') : (await db.query('SELECT * FROM bookings')).rows;
    const alerts = isMem ? memoryStore.find('alerts') : (await db.query('SELECT * FROM alerts')).rows;

    let totalLoadWatts = 0;
    let onDevices = 0;
    let totalDevices = devices.length;

    // Power by category
    const byCategory = {
      light: 0,
      fan: 0,
      ac: 0,
      workstation: 0,
      projector: 0
    };

    devices.forEach(d => {
      if (d.status === 'on') {
        onDevices++;
        const p = Number(d.power_watts) || 0;
        totalLoadWatts += p;
        if (byCategory[d.type] !== undefined) {
          byCategory[d.type] += p;
        }
      }
    });

    // Building breakdown
    const buildingBreakdown = buildings.map(b => {
      const bRooms = rooms.filter(r => r.building_id === b.id);
      const bRoomIds = bRooms.map(r => r.id);
      const bDevices = devices.filter(d => bRoomIds.includes(d.room_id) && d.status === 'on');
      const powerW = bDevices.reduce((sum, d) => sum + Number(d.power_watts), 0);
      const powerKw = +(powerW / 1000).toFixed(2);
      const occupants = bRooms.reduce((sum, r) => sum + (r.current_occupancy || 0), 0);
      const capacity = bRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        powerKw,
        carbonTarget: Number(b.carbon_target_kwh),
        occupants,
        capacity,
        occupancyPercent: capacity ? Math.round((occupants / capacity) * 100) : 0,
        activeRooms: bRooms.filter(r => r.current_occupancy > 0).length,
        totalRooms: bRooms.length
      };
    });

    const totalKw = +(totalLoadWatts / 1000).toFixed(2);
    // Grid emission factor: ~0.82 kg CO2 per kWh
    const carbonRateKgPerHour = +(totalKw * 0.82).toFixed(2);
    // Estimated electricity tariff: $0.14 / kWh
    const costRatePerHour = +(totalKw * 0.14).toFixed(2);

    // Today's total estimated energy (scaled)
    const todayTotalKwh = +(totalKw * 7.5 + 420.5).toFixed(1);
    const todayCarbonKg = +(todayTotalKwh * 0.82).toFixed(1);
    const todayCost = +(todayTotalKwh * 0.14).toFixed(2);
    const energySavedKwh = +(todayTotalKwh * 0.228).toFixed(1); // 22.8% saved via software auto-control
    const costSavedUsd = +(energySavedKwh * 0.14).toFixed(2);

    return {
      livePowerKw: totalKw,
      carbonRateKgPerHour,
      costRatePerHour,
      todayTotalKwh,
      todayCarbonKg,
      todayCost,
      energySavedKwh,
      costSavedUsd,
      activeDevices: onDevices,
      totalDevices,
      totalRooms: rooms.length,
      activeRooms: rooms.filter(r => r.current_occupancy > 0).length,
      totalOccupants: rooms.reduce((sum, r) => sum + (r.current_occupancy || 0), 0),
      totalCapacity: rooms.reduce((sum, r) => sum + (r.capacity || 0), 0),
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      unresolvedAlerts: alerts.filter(a => !a.is_resolved).length,
      buildingBreakdown,
      byCategory: [
        { name: 'HVAC & ACs', value: +(byCategory.ac / 1000).toFixed(2), fill: '#3b82f6' },
        { name: 'Compute Racks', value: +(byCategory.workstation / 1000).toFixed(2), fill: '#8b5cf6' },
        { name: 'Lighting Grid', value: +(byCategory.light / 1000).toFixed(2), fill: '#10b981' },
        { name: 'Fans & Ventilation', value: +(byCategory.fan / 1000).toFixed(2), fill: '#06b6d4' },
        { name: 'AV & Projectors', value: +(byCategory.projector / 1000).toFixed(2), fill: '#f59e0b' }
      ],
      hourlyTrend: this.historyBuffer,
      realtimeStream: this.realtimeBuffer
    };
  }
}

const campusSimulation = new CampusSimulationService();
campusSimulation.start();

module.exports = campusSimulation;
