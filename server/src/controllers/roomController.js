const db = require('../config/db');

async function getAllRooms(req, res) {
  try {
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    if (isMem) {
      const rooms = memoryStore.find('rooms').map(r => {
        const building = memoryStore.findOne('buildings', b => b.id === r.building_id);
        const devices = memoryStore.find('devices', d => d.room_id === r.id);
        const activeDevices = devices.filter(d => d.status === 'on');
        const activeWatts = activeDevices.reduce((sum, d) => sum + Number(d.power_watts), 0);

        return {
          ...r,
          building_name: building ? building.name : 'Unknown Block',
          building_code: building ? building.code : '',
          total_devices: devices.length,
          active_devices_count: activeDevices.length,
          current_power_w: activeWatts,
          devices
        };
      });
      return res.json(rooms);
    }

    const query = `
      SELECT r.*, b.name as building_name, b.code as building_code,
        COUNT(d.id) as total_devices,
        COUNT(CASE WHEN d.status = 'on' THEN 1 END) as active_devices_count,
        COALESCE(SUM(CASE WHEN d.status = 'on' THEN d.power_watts ELSE 0 END), 0) as current_power_w
      FROM rooms r
      JOIN buildings b ON r.building_id = b.id
      LEFT JOIN devices d ON r.id = d.room_id
      GROUP BY r.id, b.name, b.code
      ORDER BY r.id ASC
    `;
    const result = await db.query(query);
    return res.json(result.rows);
  } catch (err) {
    console.error('Get rooms error:', err);
    return res.status(500).json({ error: 'Failed to retrieve rooms' });
  }
}

async function updateRoomOccupancy(req, res) {
  try {
    const { id } = req.params;
    const { occupancy } = req.body;
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;
    const pax = parseInt(occupancy, 10);

    if (isNaN(pax) || pax < 0) {
      return res.status(400).json({ error: 'Occupancy must be a non-negative integer' });
    }

    if (isMem) {
      const room = memoryStore.findOne('rooms', r => r.id === parseInt(id, 10));
      if (!room) return res.status(404).json({ error: 'Room not found' });
      room.current_occupancy = pax;
      room.last_motion_at = new Date().toISOString();
      return res.json({ message: `Occupancy updated to ${pax}`, room });
    }

    const result = await db.query(
      'UPDATE rooms SET current_occupancy = $1, last_motion_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [pax, parseInt(id, 10)]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Room not found' });

    return res.json({ message: `Occupancy updated to ${pax}`, room: result.rows[0] });
  } catch (err) {
    console.error('Update occupancy error:', err);
    return res.status(500).json({ error: 'Failed to update occupancy' });
  }
}

async function toggleAutoControl(req, res) {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;
    const autoVal = Boolean(enabled);

    if (isMem) {
      const room = memoryStore.findOne('rooms', r => r.id === parseInt(id, 10));
      if (!room) return res.status(404).json({ error: 'Room not found' });
      room.auto_control_enabled = autoVal;
      return res.json({ message: `Auto-Control is now ${autoVal ? 'ENABLED' : 'DISABLED'}`, room });
    }

    const result = await db.query(
      'UPDATE rooms SET auto_control_enabled = $1 WHERE id = $2 RETURNING *',
      [autoVal, parseInt(id, 10)]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Room not found' });

    return res.json({ message: `Auto-Control updated`, room: result.rows[0] });
  } catch (err) {
    console.error('Toggle auto control error:', err);
    return res.status(500).json({ error: 'Failed to toggle auto control' });
  }
}

module.exports = {
  getAllRooms,
  updateRoomOccupancy,
  toggleAutoControl
};
