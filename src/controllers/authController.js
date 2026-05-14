import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    
    console.log('📝 Registering user:', { name, email, phone });
    
    const exists = await db('users').where({ email }).first();
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db('users')
      .insert({ name, email, password: hashed, phone, role: 'customer' })
      .returning(['id', 'name', 'email', 'role', 'phone']);
    
    console.log('✅ User registered:', user.id);
    res.status(201).json({ user, token: sign(user) });
  } catch (err) { 
    console.error('❌ Registration Error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' }); 
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔑 Login attempt:', email);
    
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    
    const { password: _, ...safe } = user;
    res.json({ user: safe, token: sign(user) });
  } catch (err) { 
    console.error('❌ Login Error:', err);
    res.status(500).json({ error: err.message || 'Login failed' }); 
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await db('users').where({ id: req.user.id })
      .select('id', 'name', 'email', 'role', 'phone', 'created_at').first();
    res.json(user);
  } catch (err) { 
    console.error('❌ GetMe Error:', err);
    res.status(500).json({ error: err.message }); 
  }
};

export const demoLogin = async (req, res) => {
  try {
    const { role } = req.body;
    console.log('🚀 Demo Login Request for role:', role);
    
    // Find a user with this role from the DB
    let user = await db('users').where({ role }).first();
    
    // If no such user exists, create a dummy one for demo purposes
    if (!user) {
      console.log('⚠️ No user found for role', role, '- creating temporary demo user');
      user = {
        id: 9999,
        name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        email: `${role}@demo.com`,
        role: role,
        phone: '000-000-0000'
      };
    } else {
      // Remove password before sending
      delete user.password;
    }
    
    res.json({ user, token: sign(user) });
  } catch (err) {
    console.error('❌ Demo Login Error:', err);
    res.status(500).json({ error: err.message || 'Demo login failed' });
  }
};
