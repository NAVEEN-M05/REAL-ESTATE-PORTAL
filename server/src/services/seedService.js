const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedData() {
  const isMem = db.isUsingMemoryStore();
  const memoryStore = db.memoryStore;

  // Hashes
  const adminPass = bcrypt.hashSync('admin123', 10);
  const facultyPass = bcrypt.hashSync('faculty123', 10);
  const studentPass = bcrypt.hashSync('student123', 10);

  const initialUsers = [
    {
      name: 'Dr. Evelyn Reed (Campus Admin)',
      email: 'admin@campus.edu',
      password_hash: adminPass,
      role: 'admin',
      department: 'Campus Infrastructure & Energy Operations'
    },
    {
      name: 'Prof. Sarah Jenkins',
      email: 'prof.sarah@campus.edu',
      password_hash: facultyPass,
      role: 'faculty',
      department: 'Computer Science & Robotics'
    },
    {
      name: 'Alex Rivera',
      email: 'alex.student@campus.edu',
      password_hash: studentPass,
      role: 'student',
      department: 'Electrical & Electronics Engineering'
    }
  ];

  const initialBuildings = [
    { name: 'Aryabhata Science & Tech Block', code: 'ASTB', total_floors: 4, carbon_target_kwh: 1400.0 },
    { name: 'Kalam Engineering Tower', code: 'KET', total_floors: 6, carbon_target_kwh: 1850.0 },
    { name: 'Central Digital Library', code: 'CDL', total_floors: 3, carbon_target_kwh: 850.0 },
    { name: 'Tagore Seminar & Auditorium Complex', code: 'TSA', total_floors: 2, carbon_target_kwh: 1100.0 }
  ];

  const initialRooms = [
    // ASTB
    { building_id: 1, name: 'Robotics & AI Lab', code: 'ASTB-301', type: 'lab', capacity: 35, floor: 3, current_occupancy: 18, max_occupancy: 35, auto_control_enabled: true, temp_celsius: 23.2 },
    { building_id: 1, name: 'Smart Lecture Hall 101', code: 'ASTB-101', type: 'classroom', capacity: 75, floor: 1, current_occupancy: 54, max_occupancy: 75, auto_control_enabled: true, temp_celsius: 24.0 },
    { building_id: 1, name: 'Computer Vision Studio', code: 'ASTB-204', type: 'lab', capacity: 40, floor: 2, current_occupancy: 0, max_occupancy: 40, auto_control_enabled: true, temp_celsius: 26.5 },
    { building_id: 1, name: 'Faculty Collaboration Lounge', code: 'ASTB-402', type: 'faculty_lounge', capacity: 20, floor: 4, current_occupancy: 6, max_occupancy: 20, auto_control_enabled: false, temp_celsius: 23.8 },
    // KET
    { building_id: 2, name: 'IoT & Embedded Systems Lab', code: 'KET-102', type: 'lab', capacity: 30, floor: 1, current_occupancy: 12, max_occupancy: 30, auto_control_enabled: true, temp_celsius: 24.1 },
    { building_id: 2, name: 'CAD / Heavy Simulation Center', code: 'KET-205', type: 'lab', capacity: 45, floor: 2, current_occupancy: 22, max_occupancy: 45, auto_control_enabled: true, temp_celsius: 22.8 },
    { building_id: 2, name: 'Engineering Classroom 302', code: 'KET-302', type: 'classroom', capacity: 60, floor: 3, current_occupancy: 0, max_occupancy: 60, auto_control_enabled: true, temp_celsius: 27.0 },
    // CDL
    { building_id: 3, name: 'Quiet Study & Digital Reading Hall', code: 'CDL-G01', type: 'library_hall', capacity: 90, floor: 1, current_occupancy: 48, max_occupancy: 90, auto_control_enabled: true, temp_celsius: 23.5 },
    { building_id: 3, name: 'Collaborative Research Pod 3', code: 'CDL-P03', type: 'library_hall', capacity: 12, floor: 2, current_occupancy: 0, max_occupancy: 12, auto_control_enabled: true, temp_celsius: 25.8 },
    // TSA
    { building_id: 4, name: 'Grand Auditorium Alpha', code: 'TSA-AUD1', type: 'seminar_hall', capacity: 250, floor: 1, current_occupancy: 0, max_occupancy: 250, auto_control_enabled: true, temp_celsius: 28.0 }
  ];

  const initialDevices = [
    // ASTB-301 (Robotics Lab)
    { room_id: 1, name: 'Ceiling LED Matrix (60W)', type: 'light', status: 'on', power_watts: 180.0, auto_controlled: true, run_time_hours: 84.5 },
    { room_id: 1, name: 'High-Efficiency BLDC Fans', type: 'fan', status: 'on', power_watts: 135.0, auto_controlled: true, run_time_hours: 92.0 },
    { room_id: 1, name: 'Precision Dual Inverter AC', type: 'ac', status: 'on', power_watts: 2400.0, auto_controlled: true, run_time_hours: 110.2 },
    { room_id: 1, name: 'Robotics Bench Workstations (x12)', type: 'workstation', status: 'on', power_watts: 2100.0, auto_controlled: false, run_time_hours: 65.0 },

    // ASTB-101 (Lecture Hall)
    { room_id: 2, name: 'Auditorium Tier Lights', type: 'light', status: 'on', power_watts: 240.0, auto_controlled: true, run_time_hours: 115.0 },
    { room_id: 2, name: 'Lecture Hall Multi-Fans', type: 'fan', status: 'on', power_watts: 180.0, auto_controlled: true, run_time_hours: 120.0 },
    { room_id: 2, name: 'Central Air Conditioner Unit 1', type: 'ac', status: 'on', power_watts: 3200.0, auto_controlled: true, run_time_hours: 130.0 },
    { room_id: 2, name: 'Interactive Laser 4K Projector', type: 'projector', status: 'on', power_watts: 350.0, auto_controlled: true, run_time_hours: 45.0 },

    // ASTB-204 (Vision Studio - Unoccupied)
    { room_id: 3, name: 'Studio Ceiling Lights', type: 'light', status: 'off', power_watts: 120.0, auto_controlled: true, run_time_hours: 40.0 },
    { room_id: 3, name: 'Circulation Exhaust Fans', type: 'fan', status: 'off', power_watts: 90.0, auto_controlled: true, run_time_hours: 38.0 },
    { room_id: 3, name: 'Cooling Inverter AC Unit', type: 'ac', status: 'off', power_watts: 1800.0, auto_controlled: true, run_time_hours: 72.0 },

    // ASTB-402 (Faculty Lounge)
    { room_id: 4, name: 'Ambient Warm Lighting', type: 'light', status: 'on', power_watts: 80.0, auto_controlled: false, run_time_hours: 140.0 },
    { room_id: 4, name: 'Comfort AC Unit', type: 'ac', status: 'on', power_watts: 1500.0, auto_controlled: false, run_time_hours: 98.0 },

    // KET-102 (IoT Lab)
    { room_id: 5, name: 'Main Lab Lights', type: 'light', status: 'on', power_watts: 140.0, auto_controlled: true, run_time_hours: 70.0 },
    { room_id: 5, name: 'Ventilation Fans', type: 'fan', status: 'on', power_watts: 90.0, auto_controlled: true, run_time_hours: 70.0 },
    { room_id: 5, name: 'Inverter Split AC', type: 'ac', status: 'on', power_watts: 1650.0, auto_controlled: true, run_time_hours: 85.0 },
    { room_id: 5, name: 'Testbench Power Racks', type: 'workstation', status: 'on', power_watts: 800.0, auto_controlled: false, run_time_hours: 60.0 },

    // KET-205 (CAD Lab)
    { room_id: 6, name: 'Workstation Grid Lighting', type: 'light', status: 'on', power_watts: 200.0, auto_controlled: true, run_time_hours: 104.0 },
    { room_id: 6, name: 'High-Capacity VRF AC', type: 'ac', status: 'on', power_watts: 2800.0, auto_controlled: true, run_time_hours: 112.0 },
    { room_id: 6, name: 'CAD GPU Render Farm', type: 'workstation', status: 'on', power_watts: 3200.0, auto_controlled: false, run_time_hours: 180.0 },

    // KET-302 (Unoccupied Classroom)
    { room_id: 7, name: 'Standard Classroom Lights', type: 'light', status: 'off', power_watts: 150.0, auto_controlled: true, run_time_hours: 50.0 },
    { room_id: 7, name: 'Wall Mounted Fans', type: 'fan', status: 'off', power_watts: 120.0, auto_controlled: true, run_time_hours: 62.0 },

    // CDL-G01 (Library)
    { room_id: 8, name: 'Energy-Saving Daylighting Tubes', type: 'light', status: 'on', power_watts: 350.0, auto_controlled: true, run_time_hours: 210.0 },
    { room_id: 8, name: 'Central Quiet AC 1 & 2', type: 'ac', status: 'on', power_watts: 3800.0, auto_controlled: true, run_time_hours: 220.0 },

    // CDL-P03 (Study Pod)
    { room_id: 9, name: 'Pod Focused Task Light', type: 'light', status: 'off', power_watts: 45.0, auto_controlled: true, run_time_hours: 30.0 },
    { room_id: 9, name: 'Compact Mini AC', type: 'ac', status: 'off', power_watts: 900.0, auto_controlled: true, run_time_hours: 28.0 },

    // TSA-AUD1 (Auditorium)
    { room_id: 10, name: 'Main Stage & House Luminaire', type: 'light', status: 'off', power_watts: 1200.0, auto_controlled: true, run_time_hours: 25.0 },
    { room_id: 10, name: 'High-Ton Heavy AC Chiller Unit', type: 'ac', status: 'off', power_watts: 8500.0, auto_controlled: true, run_time_hours: 20.0 }
  ];

  const now = new Date();
  const initialBookings = [
    {
      room_id: 1, // Robotics Lab
      user_id: 2, // Prof Sarah
      purpose: 'Autonomous Quadcopter Firmware Workshop',
      start_time: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 2 * 3600 * 1000).toISOString(),
      attendees: 18,
      status: 'approved',
      auto_devices: true,
      notes: 'Requires dual inverter AC and all workstation racks powered.'
    },
    {
      room_id: 2, // Lecture Hall
      user_id: 2,
      purpose: 'CS402 Machine Learning Lecture',
      start_time: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
      attendees: 54,
      status: 'approved',
      auto_devices: true,
      notes: 'Interactive projector required.'
    },
    {
      room_id: 9, // CDL Pod 3
      user_id: 3, // Alex Student
      purpose: 'Senior Capstone Project Group Discussion',
      start_time: new Date(now.getTime() + 3 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 5 * 3600 * 1000).toISOString(),
      attendees: 4,
      status: 'pending',
      auto_devices: true,
      notes: 'Study pod needed for team presentation prep.'
    },
    {
      room_id: 10, // Auditorium
      user_id: 2,
      purpose: 'Annual AI & Renewable Green Campus Summit',
      start_time: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
      end_time: new Date(now.getTime() + 28 * 3600 * 1000).toISOString(),
      attendees: 180,
      status: 'approved',
      auto_devices: true,
      notes: 'Full sound system and chiller cooling scheduled.'
    }
  ];

  const initialAlerts = [
    {
      room_id: 3,
      building_id: 1,
      type: 'unoccupied_waste',
      message: 'Computer Vision Studio (ASTB-204) remained empty for 12 minutes with lighting active. Automated eco-rules powered down devices.',
      severity: 'medium',
      is_resolved: true,
      created_at: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
    },
    {
      room_id: 6,
      building_id: 2,
      type: 'energy_spike',
      message: 'CAD / Heavy Simulation Center (KET-205) power draw exceeded 6.0 kW threshold during GPU compute batch.',
      severity: 'high',
      is_resolved: false,
      created_at: new Date(now.getTime() - 20 * 60 * 1000).toISOString()
    },
    {
      room_id: 7,
      building_id: 2,
      type: 'eco_saving',
      message: 'Engineering Classroom 302 automated shutdown saved ~3.4 kWh during off-schedule empty window.',
      severity: 'low',
      is_resolved: false,
      created_at: new Date(now.getTime() - 10 * 60 * 1000).toISOString()
    }
  ];

  const initialAutomationRules = [
    {
      name: 'Unoccupied Room Auto-Shutoff',
      description: 'Automatically switches off lighting and fans if room occupancy is zero for more than 5 minutes',
      condition_param: 'idle_minutes',
      threshold_value: 5,
      action_type: 'power_off_lights_fans',
      is_active: true
    },
    {
      name: 'AC Eco-Temperature Regulation',
      description: 'Sets AC temperature to 24°C when room occupancy is below 50% capacity to reduce compressor load',
      condition_param: 'occupancy_ratio',
      threshold_value: 0.5,
      action_type: 'set_ac_eco_temp',
      is_active: true
    },
    {
      name: 'Peak Hour Load Shedding Alert',
      description: 'Flags real-time alert and notifies facility manager if building power exceeds 85% of rated ceiling',
      condition_param: 'building_power_kw',
      threshold_value: 85.0,
      action_type: 'emit_energy_spike_alert',
      is_active: true
    }
  ];

  if (isMem) {
    // Populate memoryStore if empty
    if (memoryStore.data.users.length === 0) {
      initialUsers.forEach(u => memoryStore.insert('users', u));
      initialBuildings.forEach(b => memoryStore.insert('buildings', b));
      initialRooms.forEach(r => memoryStore.insert('rooms', r));
      initialDevices.forEach(d => memoryStore.insert('devices', d));
      initialBookings.forEach(b => memoryStore.insert('bookings', b));
      initialAlerts.forEach(a => memoryStore.insert('alerts', a));
      initialAutomationRules.forEach(r => memoryStore.insert('automation_rules', r));
      console.log('🌱 [Seeder] Seeded mock dataset into In-Memory Store.');
    }
  } else {
    // Populate real PostgreSQL if empty
    try {
      const userCheck = await db.query('SELECT count(*) FROM users');
      if (parseInt(userCheck.rows[0].count, 10) === 0) {
        for (const u of initialUsers) {
          await db.query(
            'INSERT INTO users (name, email, password_hash, role, department) VALUES ($1, $2, $3, $4, $5)',
            [u.name, u.email, u.password_hash, u.role, u.department]
          );
        }
        for (const b of initialBuildings) {
          await db.query(
            'INSERT INTO buildings (name, code, total_floors, carbon_target_kwh) VALUES ($1, $2, $3, $4)',
            [b.name, b.code, b.total_floors, b.carbon_target_kwh]
          );
        }
        for (const r of initialRooms) {
          await db.query(
            'INSERT INTO rooms (building_id, name, code, type, capacity, floor, current_occupancy, max_occupancy, auto_control_enabled, temp_celsius) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [r.building_id, r.name, r.code, r.type, r.capacity, r.floor, r.current_occupancy, r.max_occupancy, r.auto_control_enabled, r.temp_celsius]
          );
        }
        for (const d of initialDevices) {
          await db.query(
            'INSERT INTO devices (room_id, name, type, status, power_watts, auto_controlled, run_time_hours) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [d.room_id, d.name, d.type, d.status, d.power_watts, d.auto_controlled, d.run_time_hours]
          );
        }
        for (const bk of initialBookings) {
          await db.query(
            'INSERT INTO bookings (room_id, user_id, purpose, start_time, end_time, attendees, status, auto_devices, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [bk.room_id, bk.user_id, bk.purpose, bk.start_time, bk.end_time, bk.attendees, bk.status, bk.auto_devices, bk.notes]
          );
        }
        for (const a of initialAlerts) {
          await db.query(
            'INSERT INTO alerts (room_id, building_id, type, message, severity, is_resolved) VALUES ($1, $2, $3, $4, $5, $6)',
            [a.room_id, a.building_id, a.type, a.message, a.severity, a.is_resolved]
          );
        }
        for (const ar of initialAutomationRules) {
          await db.query(
            'INSERT INTO automation_rules (name, description, condition_param, threshold_value, action_type, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
            [ar.name, ar.description, ar.condition_param, ar.threshold_value, ar.action_type, ar.is_active]
          );
        }
        console.log('🌱 [Seeder] Seeded dataset into PostgreSQL database.');
      }
    } catch (err) {
      console.warn('[Seeder Warning] Failed to seed PostgreSQL database:', err.message);
    }
  }
}

module.exports = { seedData };
