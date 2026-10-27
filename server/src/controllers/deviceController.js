const db = require('../config/db');

async function getAllDevices(req, res) {
  try {
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    if (isMem) {
      const devices = memoryStore.find('devices').map(d => {
        const room = memoryStore.findOne('rooms', r => r.id === d.room_id);
        const building = room ? memoryStore.findOne('buildings', b => b.id === room.building_id) : null;
        return {
          ...d,
          room_name: room ? room.name : 'Unknown Room',
          room_code: room ? room.code : '',
          building_name: building ? building.name : 'Campus Block'
        };
      });
      return res.json(devices);
    }

    const query = `
      SELECT d.*, r.name as room_name, r.code as room_code, b.name as building_name
      FROM devices d
      JOIN rooms r ON d.room_id = r.id
      JOIN buildings b ON r.building_id = b.id
      ORDER BY d.id ASC
    `;
    const result = await db.query(query);
    return res.json(result.rows);
  } catch (err) {
    console.error('Get devices error:', err);
    return res.status(500).json({ error: 'Failed to fetch devices' });
  }
}

async function toggleDevice(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'on' or 'off'
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    if (!['on', 'off'].includes(status)) {
      return res.status(400).json({ error: "Device status must be 'on' or 'off'" });
    }

    if (isMem) {
      const device = memoryStore.findOne('devices', d => d.id === parseInt(id, 10));
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      device.status = status;
      return res.json({ message: `Device '${device.name}' switched ${status.toUpperCase()}`, device });
    }

    const result = await db.query(
      'UPDATE devices SET status = $1 WHERE id = $2 RETURNING *',
      [status, parseInt(id, 10)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }

    return res.json({ message: `Device switched ${status.toUpperCase()}`, device: result.rows[0] });
  } catch (err) {
    console.error('Toggle device error:', err);
    return res.status(500).json({ error: 'Failed to update device state' });
  }
}

async function bulkRoomControl(req, res) {
  try {
    const { roomId } = req.params;
    const { action } = req.body; // 'all_off', 'all_on', 'eco_lights_only'
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;
    const rId = parseInt(roomId, 10);

    if (isMem) {
      const devices = memoryStore.find('devices', d => d.room_id === rId);
      devices.forEach(d => {
        if (action === 'all_off') d.status = 'off';
        if (action === 'all_on') d.status = 'on';
        if (action === 'eco_lights_only') {
          if (d.type === 'light') d.status = 'on';
          if (d.type === 'ac' || d.type === 'workstation') d.status = 'off';
        }
      });
      return res.json({ message: `Bulk action '${action}' applied to room ${rId}`, count: devices.length });
    }

    if (action === 'all_off') {
      await db.query("UPDATE devices SET status = 'off' WHERE room_id = $1", [rId]);
    } else if (action === 'all_on') {
      await db.query("UPDATE devices SET status = 'on' WHERE room_id = $1", [rId]);
    } else if (action === 'eco_lights_only') {
      await db.query("UPDATE devices SET status = CASE WHEN type = 'light' THEN 'on' ELSE 'off' END WHERE room_id = $1", [rId]);
    }

    return res.json({ message: `Bulk action '${action}' applied successfully` });
  } catch (err) {
    console.error('Bulk control error:', err);
    return res.status(500).json({ error: 'Failed to execute bulk room control' });
  }
}

module.exports = {
  getAllDevices,
  toggleDevice,
  bulkRoomControl
};
