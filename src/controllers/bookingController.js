import db from '../config/db.js';

export const createBooking = async (req, res) => {
  try {
    const { vehicle_id, package_id, issue_description, preferred_date, preferred_time } = req.body;
    if (!vehicle_id || !issue_description || !preferred_date)
      return res.status(400).json({ error: 'vehicle_id, issue_description and preferred_date are required' });
    const vehicle = await db('vehicles').where({ id: vehicle_id, customer_id: req.user.id }).first();
    if (!vehicle) return res.status(403).json({ error: 'Vehicle not found or not yours' });
    const [booking] = await db('bookings')
      .insert({ customer_id: req.user.id, vehicle_id, package_id: package_id || null, issue_description, preferred_date, preferred_time, status: 'pending' })
      .returning('*');
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getBookings = async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = db('bookings as b')
      .join('users as u', 'u.id', 'b.customer_id')
      .join('vehicles as v', 'v.id', 'b.vehicle_id')
      .select('b.*', 'u.name as customer_name', 'u.email as customer_email', 'u.phone as customer_phone',
              'v.make', 'v.model', 'v.license_plate', 'v.year')
      .orderBy('b.created_at', 'desc');
    if (role === 'customer') query = query.where('b.customer_id', id);
    const bookings = await query;
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await db('bookings as b')
      .join('users as u', 'u.id', 'b.customer_id')
      .join('vehicles as v', 'v.id', 'b.vehicle_id')
      .select('b.*', 'u.name as customer_name', 'u.email as customer_email', 'u.phone as customer_phone',
              'v.make', 'v.model', 'v.license_plate', 'v.year', 'v.color')
      .where('b.id', req.params.id).first();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await db('bookings').where({ id: req.params.id }).update({ status }).returning('*');
    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
export const deleteBooking = async (req, res) => {
  try {
    const deleted = await db('bookings').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
