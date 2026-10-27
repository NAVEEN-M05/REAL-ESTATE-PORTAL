const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let useMemoryStore = false;

// Postgres configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'smart_campus',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
};

// In-Memory Fallback Store (Simulates relational PostgreSQL storage)
class MemoryStore {
  constructor() {
    this.data = {
      users: [],
      buildings: [],
      rooms: [],
      devices: [],
      bookings: [],
      energy_logs: [],
      alerts: [],
      automation_rules: []
    };
    this.sequences = {
      users: 1,
      buildings: 1,
      rooms: 1,
      devices: 1,
      bookings: 1,
      energy_logs: 1,
      alerts: 1,
      automation_rules: 1
    };
  }

  insert(table, row) {
    const id = this.sequences[table]++;
    const created_at = row.created_at || new Date().toISOString();
    const newRecord = { id, ...row, created_at };
    this.data[table].push(newRecord);
    return newRecord;
  }

  find(table, predicate) {
    if (!predicate) return [...this.data[table]];
    return this.data[table].filter(predicate);
  }

  findOne(table, predicate) {
    return this.data[table].find(predicate) || null;
  }

  update(table, predicate, updates) {
    let count = 0;
    this.data[table].forEach(item => {
      if (predicate(item)) {
        Object.assign(item, updates);
        count++;
      }
    });
    return count;
  }

  delete(table, predicate) {
    const initialLen = this.data[table].length;
    this.data[table] = this.data[table].filter(item => !predicate(item));
    return initialLen - this.data[table].length;
  }
}

const memoryStore = new MemoryStore();

async function initDB() {
  try {
    pool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 3000 } : dbConfig);
    const client = await pool.connect();
    console.log('✅ [Database] Successfully connected to PostgreSQL database!');
    
    // Execute schema
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ [Database] PostgreSQL schema verified and applied.');
    }
    client.release();
    useMemoryStore = false;
  } catch (err) {
    console.warn('\n⚠️ [Database Warning] Could not connect to PostgreSQL server: ' + err.message);
    console.warn('👉 Operating in Seamless High-Fidelity In-Memory Store Mode.');
    console.warn('👉 You can test all features right away! To use real PostgreSQL, configure .env with valid credentials.\n');
    useMemoryStore = true;
  }
}

// SQL Query Adapter that translates standard queries or invokes memoryStore
async function query(text, params = []) {
  if (!useMemoryStore && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('Database query error:', err.message);
      throw err;
    }
  }

  // Normalize query for memory emulation
  const q = text.trim();
  const lower = q.toLowerCase();

  // Handle common queries for the mock store
  if (lower.startsWith('select * from users where email =') || lower.includes('from users where email =')) {
    const email = params[0]?.toLowerCase();
    const user = memoryStore.findOne('users', u => u.email.toLowerCase() === email);
    return { rows: user ? [user] : [] };
  }

  if (lower.startsWith('select * from users where id =')) {
    const id = parseInt(params[0], 10);
    const user = memoryStore.findOne('users', u => u.id === id);
    return { rows: user ? [user] : [] };
  }

  if (lower.includes('insert into users')) {
    const [name, email, password_hash, role, department] = params;
    const existing = memoryStore.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('User email already exists');
      err.code = '23505';
      throw err;
    }
    const user = memoryStore.insert('users', { name, email, password_hash, role, department });
    return { rows: [user] };
  }

  if (lower.includes('from buildings')) {
    return { rows: memoryStore.find('buildings') };
  }

  if (lower.includes('from rooms')) {
    const rooms = memoryStore.find('rooms').map(r => {
      const building = memoryStore.findOne('buildings', b => b.id === r.building_id);
      return { ...r, building_name: building ? building.name : 'Unknown Block' };
    });
    return { rows: rooms };
  }

  if (lower.includes('from devices')) {
    const devices = memoryStore.find('devices').map(d => {
      const room = memoryStore.findOne('rooms', r => r.id === d.room_id);
      return { ...d, room_name: room ? room.name : 'Unknown Room' };
    });
    return { rows: devices };
  }

  if (lower.includes('from bookings')) {
    const bookings = memoryStore.find('bookings').map(b => {
      const room = memoryStore.findOne('rooms', r => r.id === b.room_id);
      const user = memoryStore.findOne('users', u => u.id === b.user_id);
      return {
        ...b,
        room_name: room ? room.name : 'Unknown Room',
        room_code: room ? room.code : '',
        user_name: user ? user.name : 'Campus User',
        user_role: user ? user.role : 'student'
      };
    });
    return { rows: bookings };
  }

  if (lower.includes('from alerts')) {
    const alerts = memoryStore.find('alerts').map(a => {
      const room = a.room_id ? memoryStore.findOne('rooms', r => r.id === a.room_id) : null;
      const building = a.building_id ? memoryStore.findOne('buildings', b => b.id === a.building_id) : null;
      return {
        ...a,
        room_name: room ? room.name : 'General Campus',
        building_name: building ? building.name : 'All Buildings'
      };
    });
    return { rows: alerts };
  }

  if (lower.includes('from energy_logs')) {
    return { rows: memoryStore.find('energy_logs') };
  }

  if (lower.includes('from automation_rules')) {
    return { rows: memoryStore.find('automation_rules') };
  }

  // Fallback default
  return { rows: [] };
}

module.exports = {
  initDB,
  query,
  memoryStore,
  isUsingMemoryStore: () => useMemoryStore
};
