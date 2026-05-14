import db from '../config/db.js';

export const getInvoice = async (req, res) => {
  try {
    const invoice = await db('invoices as i')
      .join('job_cards as jc', 'jc.id', 'i.job_card_id')
      .join('bookings as b', 'b.id', 'jc.booking_id')
      .join('users as c', 'c.id', 'b.customer_id')
      .join('vehicles as v', 'v.id', 'b.vehicle_id')
      .leftJoin('service_packages as sp', 'sp.id', 'jc.package_id')
      .select('i.*', 'jc.repair_status', 'jc.estimated_cost', 'jc.actual_cost',
              'c.name as customer_name', 'c.email as customer_email',
              'v.make', 'v.model', 'v.license_plate',
              'sp.name as package_name', 'b.issue_description')
      .where('i.job_card_id', req.params.jobCardId).first();
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const processPayment = async (req, res) => {
  try {
    const { job_card_id, payment_method } = req.body;
    if (!job_card_id || !payment_method) return res.status(400).json({ error: 'job_card_id and payment_method required' });
    const invoice = await db('invoices').where({ job_card_id }).first();
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    if (invoice.payment_status === 'paid') return res.status(400).json({ error: 'Already paid' });
    const [updated] = await db('invoices')
      .where({ job_card_id })
      .update({ payment_status: 'paid', payment_method, paid_at: new Date() })
      .returning('*');
    res.json({ success: true, invoice: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
