const db = require('../config/db');

async function getAllBookings(req, res) {
  try {
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;
    const { status, roomId } = req.query;

    if (isMem) {
      let bookings = memoryStore.find('bookings');
      if (status) bookings = bookings.filter(b => b.status === status);
      if (roomId) bookings = bookings.filter(b => b.room_id === parseInt(roomId, 10));

      const enriched = bookings.map(b => {
        const room = memoryStore.findOne('rooms', r => r.id === b.room_id);
        const user = memoryStore.findOne('users', u => u.id === b.user_id);
        return {
          ...b,
          room_name: room ? room.name : 'Unknown Room',
          room_code: room ? room.code : '',
          room_type: room ? room.type : 'classroom',
          user_name: user ? user.name : 'Campus Member',
          user_email: user ? user.email : '',
          user_role: user ? user.role : 'student'
        };
      }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json(enriched);
    }

    let query = `
      SELECT b.*, r.name as room_name, r.code as room_code, r.type as room_type,
        u.name as user_name, u.email as user_email, u.role as user_role
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }
    if (roomId) {
      params.push(parseInt(roomId, 10));
      query += ` AND b.room_id = $${params.length}`;
    }

    query += ' ORDER BY b.start_time DESC';
    const result = await db.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('Get bookings error:', err);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

async function createBooking(req, res) {
  try {
    const { room_id, purpose, start_time, end_time, attendees = 1, auto_devices = true, notes = '' } = req.body;
    const userId = req.user ? req.user.id : 1;
    const userRole = req.user ? req.user.role : 'student';

    if (!room_id || !purpose || !start_time || !end_time) {
      return res.status(400).json({ error: 'Room, purpose, start time, and end time are required' });
    }

    const start = new Date(start_time);
    const end = new Date(end_time);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid start or end date timestamp' });
    }

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;
    const rId = parseInt(room_id, 10);

    // 1. Conflict Detection
    if (isMem) {
      const existingConflict = memoryStore.find('bookings', b => {
        if (b.room_id !== rId || b.status === 'rejected' || b.status === 'cancelled') return false;
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        // Overlap condition: start < bEnd AND end > bStart
        return start < bEnd && end > bStart;
      });

      if (existingConflict.length > 0) {
        return res.status(409).json({
          error: `Time slot conflict! This room is already reserved for "${existingConflict[0].purpose}". Please select another time or room.`
        });
      }

      // Faculty requests auto-approve immediately, students become pending or auto-approved
      const autoStatus = userRole === 'faculty' || userRole === 'admin' ? 'approved' : 'approved'; // Set approved so users see instant success

      const newBooking = memoryStore.insert('bookings', {
        room_id: rId,
        user_id: userId,
        purpose,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        attendees: parseInt(attendees, 10) || 1,
        status: autoStatus,
        auto_devices: Boolean(auto_devices),
        notes
      });

      const room = memoryStore.findOne('rooms', r => r.id === rId);
      return res.status(201).json({
        message: `Reservation confirmed for ${room ? room.name : 'room'}!`,
        booking: { ...newBooking, room_name: room ? room.name : '' }
      });
    }

    // Postgres Conflict Check
    const conflictSql = `
      SELECT id, purpose FROM bookings
      WHERE room_id = $1
        AND status IN ('approved', 'pending')
        AND ($2 < end_time AND $3 > start_time)
      LIMIT 1
    `;
    const conflictResult = await db.query(conflictSql, [rId, start.toISOString(), end.toISOString()]);
    if (conflictResult.rows.length > 0) {
      return res.status(409).json({
        error: `Time slot conflict! Already booked for "${conflictResult.rows[0].purpose}". Please pick another time.`
      });
    }

    const initialStatus = 'approved';
    const insertSql = `
      INSERT INTO bookings (room_id, user_id, purpose, start_time, end_time, attendees, status, auto_devices, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const insertRes = await db.query(insertSql, [
      rId,
      userId,
      purpose,
      start.toISOString(),
      end.toISOString(),
      parseInt(attendees, 10) || 1,
      initialStatus,
      Boolean(auto_devices),
      notes
    ]);

    return res.status(201).json({
      message: 'Reservation booked successfully!',
      booking: insertRes.rows[0]
    });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ error: 'Failed to create booking reservation' });
  }
}

async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved', 'rejected', 'cancelled'
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    if (!['approved', 'rejected', 'cancelled', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    if (isMem) {
      const booking = memoryStore.findOne('bookings', b => b.id === parseInt(id, 10));
      if (!booking) return res.status(404).json({ error: 'Booking reservation not found' });
      booking.status = status;
      return res.json({ message: `Booking status updated to ${status}`, booking });
    }

    const result = await db.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, parseInt(id, 10)]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Booking reservation not found' });

    return res.json({ message: `Booking status updated to ${status}`, booking: result.rows[0] });
  } catch (err) {
    console.error('Update booking error:', err);
    return res.status(500).json({ error: 'Failed to update booking status' });
  }
}

module.exports = {
  getAllBookings,
  createBooking,
  updateBookingStatus
};
