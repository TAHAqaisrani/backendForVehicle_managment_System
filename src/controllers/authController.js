import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const sign = (user) =>
  jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    const exists = await db('users').where({ email }).first();
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db('users')
      .insert({ name, email, password: hashed, phone, role: 'customer' })
      .returning(['id', 'name', 'email', 'role', 'phone']);
    res.status(201).json({ user, token: sign(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db('users').where({ email }).first();
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const { password: _, ...safe } = user;
    res.json({ user: safe, token: sign(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMe = async (req, res) => {
  try {
    const user = await db('users').where({ id: req.user.id })
      .select('id', 'name', 'email', 'role', 'phone', 'created_at').first();
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
