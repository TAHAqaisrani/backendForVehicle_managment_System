import db from '../config/db.js';

export const search = async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query is required' });
    const term = `%${q}%`;
    let results = [];

    if (!type || type === 'vehicle') {
      const vehicles = await db('bookings as b')
        .join('vehicles as v', 'v.id', 'b.vehicle_id')
        .join('users as u', 'u.id', 'b.customer_id')
        .leftJoin('job_cards as jc', 'jc.booking_id', 'b.id')
        .select('b.id as booking_id', 'b.status as booking_status', 'b.preferred_date',
                'v.license_plate', 'v.make', 'v.model', 'u.name as customer_name',
                'jc.repair_status', 'jc.id as job_card_id')
        .whereILike('v.license_plate', term)
        .orderBy('b.created_at', 'desc');
      results = [...results, ...vehicles.map(r => ({ ...r, match_type: 'vehicle' }))];
    }

    if (!type || type === 'customer') {
      const customers = await db('bookings as b')
        .join('users as u', 'u.id', 'b.customer_id')
        .join('vehicles as v', 'v.id', 'b.vehicle_id')
        .leftJoin('job_cards as jc', 'jc.booking_id', 'b.id')
        .select('b.id as booking_id', 'b.status as booking_status', 'b.preferred_date',
                'u.name as customer_name', 'u.email as customer_email',
                'v.license_plate', 'v.make', 'v.model', 'jc.repair_status', 'jc.id as job_card_id')
        .where(function () {
          this.whereILike('u.name', term).orWhereILike('u.email', term);
        })
        .orderBy('b.created_at', 'desc');
      results = [...results, ...customers.map(r => ({ ...r, match_type: 'customer' }))];
    }

    if (!type || type === 'service') {
      const services = await db('bookings as b')
        .join('users as u', 'u.id', 'b.customer_id')
        .join('vehicles as v', 'v.id', 'b.vehicle_id')
        .leftJoin('job_cards as jc', 'jc.booking_id', 'b.id')
        .leftJoin('service_packages as sp', 'sp.id', 'jc.package_id')
        .select('b.id as booking_id', 'b.status as booking_status', 'b.preferred_date',
                'u.name as customer_name', 'v.license_plate', 'v.make', 'v.model',
                'sp.name as package_name', 'jc.repair_status', 'jc.id as job_card_id')
        .where(function () {
          this.whereILike('sp.name', term).orWhereILike('b.issue_description', term);
        })
        .orderBy('b.created_at', 'desc');
      results = [...results, ...services.map(r => ({ ...r, match_type: 'service' }))];
    }

    if (!type || type === 'date') {
      const byDate = await db('bookings as b')
        .join('users as u', 'u.id', 'b.customer_id')
        .join('vehicles as v', 'v.id', 'b.vehicle_id')
        .leftJoin('job_cards as jc', 'jc.booking_id', 'b.id')
        .select('b.id as booking_id', 'b.status as booking_status', 'b.preferred_date',
                'u.name as customer_name', 'v.license_plate', 'v.make', 'v.model',
                'jc.repair_status', 'jc.id as job_card_id')
        .whereRaw('CAST(b.preferred_date AS TEXT) ILIKE ?', [term])
        .orderBy('b.preferred_date', 'desc');
      results = [...results, ...byDate.map(r => ({ ...r, match_type: 'date' }))];
    }

    // Deduplicate by booking_id
    const seen = new Set();
    const unique = results.filter(r => {
      if (seen.has(r.booking_id)) return false;
      seen.add(r.booking_id);
      return true;
    });

    res.json({ query: q, total: unique.length, results: unique });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
