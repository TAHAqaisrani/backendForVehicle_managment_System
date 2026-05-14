import db from '../config/db.js';

export const getStats = async (req, res) => {
  try {
    const [totalBookings]  = await db('bookings').count('id as count');
    const [pendingBook]    = await db('bookings').where({ status: 'pending' }).count('id as count');
    const [activeJobs]     = await db('job_cards').whereNotIn('repair_status', ['delivered']).count('id as count');
    const [completedJobs]  = await db('job_cards').where({ repair_status: 'delivered' }).count('id as count');
    const [revenueRow]     = await db('invoices').where({ payment_status: 'paid' }).sum('total as total');
    const [pendingRevRow]  = await db('invoices').where({ payment_status: 'unpaid' }).sum('total as total');
    const [totalCustomers] = await db('users').where({ role: 'customer' }).count('id as count');
    const statusCounts     = await db('job_cards').select('repair_status').count('id as count').groupBy('repair_status');
    res.json({
      totalBookings:   parseInt(totalBookings.count),
      pendingBookings: parseInt(pendingBook.count),
      activeJobs:      parseInt(activeJobs.count),
      completedJobs:   parseInt(completedJobs.count),
      totalRevenue:    parseFloat(revenueRow.total) || 0,
      pendingRevenue:  parseFloat(pendingRevRow.total) || 0,
      totalCustomers:  parseInt(totalCustomers.count),
      statusCounts,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getRecentActivity = async (req, res) => {
  try {
    const recentBookings = await db('bookings as b')
      .join('users as u', 'u.id', 'b.customer_id')
      .join('vehicles as v', 'v.id', 'b.vehicle_id')
      .select('b.id', 'b.status', 'b.preferred_date', 'b.created_at',
              'u.name as customer_name', 'v.make', 'v.model', 'v.license_plate')
      .orderBy('b.created_at', 'desc').limit(5);
    const recentJobCards = await db('job_cards as jc')
      .join('bookings as b', 'b.id', 'jc.booking_id')
      .join('users as c', 'c.id', 'b.customer_id')
      .join('vehicles as v', 'v.id', 'b.vehicle_id')
      .select('jc.id', 'jc.repair_status', 'jc.updated_at', 'jc.is_approved',
              'c.name as customer_name', 'v.make', 'v.model', 'v.license_plate')
      .orderBy('jc.updated_at', 'desc').limit(5);
    res.json({ recentBookings, recentJobCards });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getUsers = async (req, res) => {
  try {
    const users = await db('users')
      .select('id', 'name', 'email', 'role', 'phone', 'created_at')
      .orderBy('created_at', 'desc');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
