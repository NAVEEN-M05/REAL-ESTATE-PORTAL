const db = require('../config/db');

async function getAllAlerts(req, res) {
  try {
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;
    const { resolved } = req.query;

    if (isMem) {
      let alerts = memoryStore.find('alerts');
      if (resolved !== undefined) {
        const isRes = resolved === 'true';
        alerts = alerts.filter(a => a.is_resolved === isRes);
      }
      const enriched = alerts.map(a => {
        const room = a.room_id ? memoryStore.findOne('rooms', r => r.id === a.room_id) : null;
        const bldg = a.building_id ? memoryStore.findOne('buildings', b => b.id === a.building_id) : null;
        return {
          ...a,
          room_name: room ? room.name : 'All Rooms',
          room_code: room ? room.code : '',
          building_name: bldg ? bldg.name : 'Campus Complex'
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json(enriched);
    }

    let query = `
      SELECT a.*, r.name as room_name, r.code as room_code, b.name as building_name
      FROM alerts a
      LEFT JOIN rooms r ON a.room_id = r.id
      LEFT JOIN buildings b ON a.building_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (resolved !== undefined) {
      params.push(resolved === 'true');
      query += ` AND a.is_resolved = $${params.length}`;
    }

    query += ' ORDER BY a.created_at DESC';
    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('Get alerts error:', err);
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

async function resolveAlert(req, res) {
  try {
    const { id } = req.params;
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    if (isMem) {
      const alert = memoryStore.findOne('alerts', a => a.id === parseInt(id, 10));
      if (!alert) return res.status(404).json({ error: 'Alert not found' });
      alert.is_resolved = true;
      return res.json({ message: 'Alert marked as resolved', alert });
    }

    const result = await db.query(
      'UPDATE alerts SET is_resolved = TRUE WHERE id = $1 RETURNING *',
      [parseInt(id, 10)]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Alert not found' });

    return res.json({ message: 'Alert resolved', alert: result.rows[0] });
  } catch (err) {
    console.error('Resolve alert error:', err);
    return res.status(500).json({ error: 'Failed to resolve alert' });
  }
}

async function triggerTestAlert(req, res) {
  try {
    const { room_id = 1, type = 'manual_test', message = 'Facility inspection alert triggered by operator.', severity = 'medium' } = req.body;
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    const alertData = {
      room_id: parseInt(room_id, 10),
      building_id: 1,
      type,
      message,
      severity,
      is_resolved: false,
      created_at: new Date().toISOString()
    };

    if (isMem) {
      const created = memoryStore.insert('alerts', alertData);
      return res.status(201).json({ message: 'Alert emitted', alert: created });
    }

    const result = await db.query(
      'INSERT INTO alerts (room_id, building_id, type, message, severity, is_resolved) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [alertData.room_id, alertData.building_id, alertData.type, alertData.message, alertData.severity, false]
    );

    return res.status(201).json({ message: 'Alert emitted', alert: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to trigger test alert' });
  }
}

module.exports = {
  getAllAlerts,
  resolveAlert,
  triggerTestAlert
};
