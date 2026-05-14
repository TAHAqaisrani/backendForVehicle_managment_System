import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export const getUsers = async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'name', 'email', 'role', 'phone', 'created_at')
      .orderBy('created_at', 'desc');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ error: 'Name, email, password and role are required' });
    
    const exists = await db('users').where({ email }).first();
    if (exists) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db('users')
      .insert({ name, email, password: hashed, role, phone })
      .returning(['id', 'name', 'email', 'role', 'phone']);
    res.status(201).json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent deleting self
    if (id == req.user.id) return res.status(400).json({ error: 'You cannot delete yourself' });
    
    await db('users').where({ id }).del();
    res.json({ message: 'User deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
