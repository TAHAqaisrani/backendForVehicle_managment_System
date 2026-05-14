import db from '../config/db.js';

export const getPackages = async (req, res) => {
  try {
    const packages = await db('service_packages').orderBy('base_price', 'asc');
    res.json(packages);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
