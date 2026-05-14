import db from '../config/db.js';

const jobCardQuery = () =>
  db('job_cards as jc')
    .join('bookings as b', 'b.id', 'jc.booking_id')
    .join('users as c', 'c.id', 'b.customer_id')
    .join('vehicles as v', 'v.id', 'b.vehicle_id')
    .join('users as a', 'a.id', 'jc.advisor_id')
    .leftJoin('users as t', 't.id', 'jc.technician_id')
    .leftJoin('service_packages as sp', 'sp.id', 'jc.package_id')
    .select(
      'jc.*',
      'b.issue_description', 'b.preferred_date', 'b.preferred_time', 'b.status as booking_status',
      'c.name as customer_name', 'c.email as customer_email', 'c.phone as customer_phone',
      'v.make', 'v.model', 'v.license_plate', 'v.year', 'v.color',
      'a.name as advisor_name',
      't.name as technician_name',
      'sp.name as package_name', 'sp.base_price'
    );

export const createJobCard = async (req, res) => {
  try {
    const { booking_id, technician_id, package_id, inspection_notes, estimated_cost } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'booking_id is required' });
    const booking = await db('bookings').where({ id: booking_id }).first();
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const existing = await db('job_cards').where({ booking_id }).first();
    if (existing) return res.status(400).json({ error: 'Job card already exists for this booking' });
    await db('bookings').where({ id: booking_id }).update({ status: 'confirmed' });
    const [jc] = await db('job_cards')
      .insert({ booking_id, advisor_id: req.user.id, technician_id, package_id, inspection_notes, estimated_cost, repair_status: 'booked' })
      .returning('*');
    await db('repair_logs').insert({ job_card_id: jc.id, updated_by: req.user.id, status: 'booked', notes: inspection_notes || 'Job card created' });
    await db('invoices').insert({ job_card_id: jc.id, subtotal: estimated_cost || 0, tax: ((estimated_cost || 0) * 0.1).toFixed(2), total: ((estimated_cost || 0) * 1.1).toFixed(2) });
    res.status(201).json(jc);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getJobCards = async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const id = parseInt(userId);
    let query = jobCardQuery().orderBy('jc.updated_at', 'desc');
    if (role === 'technician') query = query.where('jc.technician_id', id).where('jc.is_approved', true);
    else if (role === 'customer') query = query.where('c.id', id);
    else if (role === 'advisor') query = query.where('jc.advisor_id', id);
    const jcs = await query;
    res.json(jcs);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getJobCardById = async (req, res) => {
  try {
    const jc = await jobCardQuery().where('jc.id', req.params.id).first();
    if (!jc) return res.status(404).json({ error: 'Job card not found' });
    res.json(jc);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateJobCard = async (req, res) => {
  try {
    const { repair_status, technician_id, package_id, inspection_notes, estimated_cost, actual_cost } = req.body;
    const updates = {};
    if (repair_status) updates.repair_status = repair_status;
    
    // Handle technician and package (allow clearing them with null)
    if (technician_id !== undefined) updates.technician_id = technician_id === '' ? null : technician_id;
    if (package_id !== undefined)    updates.package_id    = package_id === '' ? null : package_id;
    
    if (inspection_notes !== undefined) updates.inspection_notes = inspection_notes;
    if (estimated_cost !== undefined)   updates.estimated_cost   = parseFloat(estimated_cost) || 0;
    if (actual_cost !== undefined)      updates.actual_cost      = parseFloat(actual_cost) || 0;
    
    updates.updated_at = new Date();
    const [jc] = await db('job_cards').where({ id: req.params.id }).update(updates).returning('*');
    if (!jc) return res.status(404).json({ error: 'Job card not found' });
    
    // Log the change and update invoice if status or cost changed
    if (repair_status || actual_cost !== undefined || estimated_cost !== undefined) {
      if (repair_status) {
        await db('repair_logs').insert({ 
          job_card_id: jc.id, 
          updated_by: req.user.id, 
          status: repair_status, 
          notes: req.body.notes || `Job card details updated` 
        });
      }
      
      const sub = parseFloat(jc.actual_cost) || parseFloat(jc.estimated_cost) || 0;
      await db('invoices').where({ job_card_id: jc.id })
        .update({ 
          subtotal: sub, 
          tax: (sub * 0.1).toFixed(2), 
          total: (sub * 1.1).toFixed(2) 
        });
    }
    res.json(jc);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getTechnicianQueue = async (req, res) => {
  try {
    const jcs = await jobCardQuery()
      .where('jc.technician_id', req.params.techId)
      .where('jc.is_approved', true)
      .whereNotIn('jc.repair_status', ['delivered'])
      .orderBy('jc.updated_at', 'desc');
    res.json(jcs);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
export const approveJobCard = async (req, res) => {
  try {
    const [jc] = await db('job_cards').where({ id: req.params.id }).update({ is_approved: true }).returning('*');
    if (!jc) return res.status(404).json({ error: 'Job card not found' });
    await db('repair_logs').insert({ job_card_id: jc.id, updated_by: req.user.id, status: jc.repair_status, notes: 'Admin approved job card' });
    res.json(jc);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteJobCard = async (req, res) => {
  try {
    const deleted = await db('job_cards').where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: 'Job card not found' });
    res.json({ message: 'Job card deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
