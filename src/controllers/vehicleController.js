import db from '../config/db.js';

export const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await db('vehicles').where({ customer_id: req.user.id }).orderBy('created_at', 'desc');
    res.json(vehicles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await db('vehicles as v')
      .join('users as u', 'u.id', 'v.customer_id')
      .select('v.*', 'u.name as customer_name', 'u.email as customer_email')
      .orderBy('v.created_at', 'desc');
    res.json(vehicles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const addVehicle = async (req, res) => {
  try {
    const { make, model, year, license_plate, color, mileage } = req.body;
    if (!make || !model || !license_plate) return res.status(400).json({ error: 'make, model and license_plate are required' });
    const exists = await db('vehicles').where({ license_plate }).first();
    if (exists) return res.status(400).json({ error: 'License plate already registered' });
    const [vehicle] = await db('vehicles')
      .insert({ customer_id: req.user.id, make, model, year, license_plate, color, mileage: mileage || 0 })
      .returning('*');
    res.status(201).json(vehicle);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getVehicleHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await db('vehicles').where({ id }).first();
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    const history = await db('bookings as b')
      .leftJoin('job_cards as jc', 'jc.booking_id', 'b.id')
      .leftJoin('service_packages as sp', 'sp.id', 'jc.package_id')
      .leftJoin('invoices as i', 'i.job_card_id', 'jc.id')
      .select('b.id as booking_id', 'b.issue_description', 'b.preferred_date', 'b.status as booking_status',
              'jc.id as job_card_id', 'jc.repair_status', 'jc.actual_cost',
              'sp.name as package_name', 'i.total', 'i.payment_status')
      .where('b.vehicle_id', id)
      .orderBy('b.preferred_date', 'desc');
    res.json({ vehicle, history });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
