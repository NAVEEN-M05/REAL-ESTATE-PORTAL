const simulation = require('../services/simulationService');
const db = require('../config/db');

async function getLiveMetrics(req, res) {
  try {
    const metrics = await simulation.getMetrics();
    return res.json(metrics);
  } catch (err) {
    console.error('Energy metrics error:', err);
    return res.status(500).json({ error: 'Failed to retrieve live energy metrics' });
  }
}

async function getBuildingAnalytics(req, res) {
  try {
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;
    const { buildingId } = req.params;

    const buildings = isMem ? memoryStore.find('buildings') : (await db.query('SELECT * FROM buildings')).rows;
    const building = buildings.find(b => b.id === parseInt(buildingId, 10));

    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    const rooms = isMem
      ? memoryStore.find('rooms', r => r.building_id === building.id)
      : (await db.query('SELECT * FROM rooms WHERE building_id = $1', [building.id])).rows;

    const roomIds = rooms.map(r => r.id);
    const devices = isMem
      ? memoryStore.find('devices', d => roomIds.includes(d.room_id))
      : (await db.query('SELECT * FROM devices WHERE room_id = ANY($1)', [roomIds])).rows;

    const powerWatts = devices
      .filter(d => d.status === 'on')
      .reduce((sum, d) => sum + Number(d.power_watts), 0);

    return res.json({
      building,
      roomsCount: rooms.length,
      devicesCount: devices.length,
      activeDevices: devices.filter(d => d.status === 'on').length,
      currentPowerKw: +(powerWatts / 1000).toFixed(2),
      rooms
    });
  } catch (err) {
    console.error('Building analytics error:', err);
    return res.status(500).json({ error: 'Failed to fetch building analytics' });
  }
}

module.exports = {
  getLiveMetrics,
  getBuildingAnalytics
};
