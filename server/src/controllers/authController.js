const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone || '+1 (555) 019-2834',
        office: user.office || 'Campus Operations Center, Suite 302',
        title: user.title || 'Director of Campus Infrastructure & Energy',
        bio: user.bio || 'Overseeing automated smart energy transition and sustainable facilities operations.'
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server authentication failed' });
  }
}

async function demoLogin(req, res) {
  try {
    const { role } = req.body;
    const targetRole = role || 'admin';

    const result = await db.query('SELECT * FROM users WHERE role = $1 LIMIT 1', [targetRole]);
    let user = result.rows[0];

    if (!user) {
      user = {
        id: targetRole === 'admin' ? 1 : targetRole === 'faculty' ? 2 : 3,
        name: targetRole === 'admin' ? 'Dr. Evelyn Reed' : targetRole === 'faculty' ? 'Prof. Sarah Jenkins' : 'Alex Rivera',
        email: `${targetRole}@campus.edu`,
        role: targetRole,
        department: targetRole === 'admin' ? 'Campus Infrastructure & Energy' : targetRole === 'faculty' ? 'Computer Science & Robotics' : 'Electrical Engineering',
        phone: '+1 (555) 019-2834',
        office: 'Main Campus Admin, Suite 302',
        title: targetRole === 'admin' ? 'Director of Campus Infrastructure & Energy' : targetRole === 'faculty' ? 'Associate Professor & Lab Chair' : 'Undergraduate Scholar & Eco-Ambassador',
        bio: 'Leading green campus technological operations and sustainable microgrid management.'
      };
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: `Demo logged in as ${user.role}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone || '+1 (555) 019-2834',
        office: user.office || 'Main Administration Block, Suite 302',
        title: user.title || (user.role === 'admin' ? 'Director of Campus Infrastructure & Energy' : user.role === 'faculty' ? 'Associate Professor' : 'Student Researcher'),
        bio: user.bio || 'Managing and participating in smart campus energy conservation initiatives.'
      }
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({ error: 'Demo login failed' });
  }
}

async function register(req, res) {
  try {
    const { name, email, password, role = 'student', department = 'General' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(400).json({ error: 'Account with this email already exists' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, department',
      [name, email.toLowerCase().trim(), hash, role, department]
    );
    const newUser = result.rows[0];

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, department: newUser.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function getProfile(req, res) {
  try {
    const result = await db.query('SELECT id, name, email, role, department, created_at FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }
    const u = result.rows[0];
    return res.json({
      ...u,
      phone: u.phone || '+1 (555) 019-2834',
      office: u.office || 'Main Administration Block, Suite 302',
      title: u.title || (u.role === 'admin' ? 'Director of Campus Infrastructure & Energy' : 'Campus Member'),
      bio: u.bio || 'Managing and participating in smart campus energy conservation initiatives.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { name, email, department, title, phone, office, bio } = req.body;
    const isMem = db.isUsingMemoryStore();
    const memoryStore = db.memoryStore;

    if (isMem) {
      const user = memoryStore.findOne('users', u => u.id === userId) || memoryStore.find('users')[0];
      if (user) {
        if (name) user.name = name;
        if (email) user.email = email;
        if (department) user.department = department;
        user.title = title || user.title;
        user.phone = phone || user.phone;
        user.office = office || user.office;
        user.bio = bio || user.bio;
      }

      const updatedUser = {
        id: user ? user.id : userId,
        name: name || user?.name || 'Administrator',
        email: email || user?.email || 'admin@campus.edu',
        role: user ? user.role : 'admin',
        department: department || user?.department || 'Campus Operations',
        title: title || 'Director of Campus Infrastructure & Energy',
        phone: phone || '+1 (555) 019-2834',
        office: office || 'Main Administration Block, Suite 302',
        bio: bio || 'Leading green campus technological operations and sustainable microgrid management.'
      };

      const token = jwt.sign(
        { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, department: updatedUser.department },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Profile updated successfully!',
        user: updatedUser,
        token
      });
    }

    // Postgres update
    const updateSql = `
      UPDATE users
      SET name = COALESCE($1, name),
          email = COALESCE($2, email),
          department = COALESCE($3, department)
      WHERE id = $4
      RETURNING id, name, email, role, department
    `;
    const result = await db.query(updateSql, [name, email, department, userId]);
    const updated = result.rows[0];

    const finalProfile = {
      ...updated,
      title: title || 'Director of Campus Infrastructure & Energy',
      phone: phone || '+1 (555) 019-2834',
      office: office || 'Main Administration Block, Suite 302',
      bio: bio || 'Leading green campus technological operations and sustainable microgrid management.'
    };

    const token = jwt.sign(
      { id: finalProfile.id, name: finalProfile.name, email: finalProfile.email, role: finalProfile.role, department: finalProfile.department },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Profile updated successfully!',
      user: finalProfile,
      token
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

module.exports = {
  login,
  demoLogin,
  register,
  getProfile,
  updateProfile
};
