import bcrypt from 'bcryptjs';

export const seed = async (knex) => {
  // Clean all tables in reverse FK order
  await knex('invoices').del();
  await knex('repair_logs').del();
  await knex('job_cards').del();
  await knex('bookings').del();
  await knex('vehicles').del();
  await knex('service_packages').del();
  await knex('users').del();

  // ── USERS ──────────────────────────────────────────────────────────────────
  const hash = (p) => bcrypt.hash(p, 10);
  const [admin, advisor, tech, customer] = await knex('users').insert([
    { name: 'Admin User',      email: 'admin@vsc.com',    password: await hash('admin123'),    role: 'admin',      phone: '0300-0000001' },
    { name: 'Sara Advisor',    email: 'advisor@vsc.com',  password: await hash('advisor123'),  role: 'advisor',    phone: '0300-0000002' },
    { name: 'Ali Technician',  email: 'tech@vsc.com',     password: await hash('tech123'),     role: 'technician', phone: '0300-0000003' },
    { name: 'John Customer',   email: 'customer@vsc.com', password: await hash('customer123'), role: 'customer',   phone: '0300-0000004' },
  ]).returning('*');

  // ── VEHICLES ───────────────────────────────────────────────────────────────
  const [v1, v2, v3] = await knex('vehicles').insert([
    { customer_id: customer.id, make: 'Toyota',  model: 'Corolla', year: 2020, license_plate: 'ABC-1234', color: 'White',  mileage: 45000 },
    { customer_id: customer.id, make: 'Honda',   model: 'Civic',   year: 2019, license_plate: 'XYZ-5678', color: 'Black',  mileage: 62000 },
    { customer_id: customer.id, make: 'Suzuki',  model: 'Swift',   year: 2022, license_plate: 'DEF-9012', color: 'Silver', mileage: 12000 },
  ]).returning('*');

  // ── SERVICE PACKAGES ───────────────────────────────────────────────────────
  const [pkg1, pkg2, pkg3, pkg4, pkg5] = await knex('service_packages').insert([
    { name: 'Oil & Filter Change',       description: 'Full synthetic oil and filter replacement.',          base_price: 45.00,  estimated_hours: 1.0 },
    { name: 'Full Service',              description: '30-point inspection, oil, filters, fluids top-up.',   base_price: 199.00, estimated_hours: 3.5 },
    { name: 'Brake Inspection & Repair', description: 'Pad, rotor & caliper inspection and replacement.',    base_price: 120.00, estimated_hours: 2.0 },
    { name: 'AC Service & Recharge',     description: 'Gas recharge, compressor check and leak test.',       base_price: 85.00,  estimated_hours: 1.5 },
    { name: 'Tire Rotation & Balance',   description: 'Rotation, balancing and pressure adjustment.',        base_price: 60.00,  estimated_hours: 1.0 },
  ]).returning('*');

  // ── BOOKINGS ───────────────────────────────────────────────────────────────
  const [b1, b2, b3, b4, b5, b6] = await knex('bookings').insert([
    { customer_id: customer.id, vehicle_id: v1.id, issue_description: 'Overdue oil change, engine noise.',     preferred_date: '2024-03-01', preferred_time: '09:00', status: 'confirmed' },
    { customer_id: customer.id, vehicle_id: v2.id, issue_description: 'Squealing brakes on hard stops.',       preferred_date: '2024-03-05', preferred_time: '10:00', status: 'confirmed' },
    { customer_id: customer.id, vehicle_id: v3.id, issue_description: 'AC not cooling, warm air blowing.',     preferred_date: '2024-03-08', preferred_time: '11:00', status: 'confirmed' },
    { customer_id: customer.id, vehicle_id: v1.id, issue_description: 'Annual full service due.',              preferred_date: '2024-03-12', preferred_time: '08:30', status: 'confirmed' },
    { customer_id: customer.id, vehicle_id: v2.id, issue_description: 'Vibration at highway speeds.',          preferred_date: '2024-03-15', preferred_time: '14:00', status: 'confirmed' },
    { customer_id: customer.id, vehicle_id: v3.id, issue_description: 'Check engine light on, rough idle.',    preferred_date: '2024-04-01', preferred_time: '09:00', status: 'pending'   },
  ]).returning('*');

  // ── JOB CARDS ──────────────────────────────────────────────────────────────
  const [jc1, jc2, jc3, jc4, jc5] = await knex('job_cards').insert([
    { booking_id: b1.id, advisor_id: advisor.id, technician_id: tech.id, package_id: pkg1.id, repair_status: 'delivered',           inspection_notes: 'Oil was very dark, filter blocked. Full replacement done.', estimated_cost: 45.00,  actual_cost: 45.00  },
    { booking_id: b2.id, advisor_id: advisor.id, technician_id: tech.id, package_id: pkg3.id, repair_status: 'ready_for_pickup',     inspection_notes: 'Front pads worn to 2mm, replaced both front pads.',          estimated_cost: 120.00, actual_cost: 120.00 },
    { booking_id: b3.id, advisor_id: advisor.id, technician_id: tech.id, package_id: pkg4.id, repair_status: 'waiting_for_parts',   inspection_notes: 'Compressor needs replacement. Part ordered.',                 estimated_cost: 220.00, actual_cost: 0.00   },
    { booking_id: b4.id, advisor_id: advisor.id, technician_id: tech.id, package_id: pkg2.id, repair_status: 'in_service',          inspection_notes: 'Comprehensive inspection started. Fluids being replaced.',     estimated_cost: 199.00, actual_cost: 0.00   },
    { booking_id: b5.id, advisor_id: advisor.id, technician_id: tech.id, package_id: pkg5.id, repair_status: 'inspected',           inspection_notes: 'Front left tire shows uneven wear. Alignment also needed.',    estimated_cost: 60.00,  actual_cost: 0.00   },
  ]).returning('*');

  // ── REPAIR LOGS ────────────────────────────────────────────────────────────
  await knex('repair_logs').insert([
    // JC1 - delivered
    { job_card_id: jc1.id, updated_by: advisor.id, status: 'booked',             notes: 'Job card created, booked for morning slot.' },
    { job_card_id: jc1.id, updated_by: tech.id,   status: 'inspected',           notes: 'Vehicle inspected. Oil and filter confirmed as next step.' },
    { job_card_id: jc1.id, updated_by: tech.id,   status: 'in_service',          notes: 'Oil drain started, new filter fitted.' },
    { job_card_id: jc1.id, updated_by: tech.id,   status: 'ready_for_pickup',    notes: 'Service complete. Vehicle cleaned and ready.' },
    { job_card_id: jc1.id, updated_by: advisor.id, status: 'delivered',          notes: 'Customer collected vehicle. Invoice settled.' },
    // JC2 - ready_for_pickup
    { job_card_id: jc2.id, updated_by: advisor.id, status: 'booked',             notes: 'Brake complaint logged. Assigned to Ali.' },
    { job_card_id: jc2.id, updated_by: tech.id,   status: 'inspected',           notes: 'Front pads at 2mm. Replacement approved by customer.' },
    { job_card_id: jc2.id, updated_by: tech.id,   status: 'in_service',          notes: 'Front brake pads being replaced.' },
    { job_card_id: jc2.id, updated_by: tech.id,   status: 'ready_for_pickup',    notes: 'Brakes tested and confirmed safe. Ready for pickup.' },
    // JC3 - waiting_for_parts
    { job_card_id: jc3.id, updated_by: advisor.id, status: 'booked',             notes: 'AC complaint logged.' },
    { job_card_id: jc3.id, updated_by: tech.id,   status: 'inspected',           notes: 'Compressor failure confirmed.' },
    { job_card_id: jc3.id, updated_by: tech.id,   status: 'waiting_for_parts',   notes: 'Compressor part ordered. ETA 3 business days.' },
    // JC4 - in_service
    { job_card_id: jc4.id, updated_by: advisor.id, status: 'booked',             notes: 'Annual service scheduled.' },
    { job_card_id: jc4.id, updated_by: tech.id,   status: 'inspected',           notes: '30-point check in progress.' },
    { job_card_id: jc4.id, updated_by: tech.id,   status: 'in_service',          notes: 'Oil, coolant and brake fluid replacement underway.' },
    // JC5 - inspected
    { job_card_id: jc5.id, updated_by: advisor.id, status: 'booked',             notes: 'Vibration complaint. Tire and wheel check requested.' },
    { job_card_id: jc5.id, updated_by: tech.id,   status: 'inspected',           notes: 'Uneven front left tire, alignment off. Awaiting customer approval for alignment add-on.' },
  ]);

  // ── INVOICES ───────────────────────────────────────────────────────────────
  const tax = (sub) => parseFloat((sub * 0.10).toFixed(2));
  await knex('invoices').insert([
    { job_card_id: jc1.id, subtotal: 45.00,  tax: tax(45),   total: 45.00  + tax(45),  payment_status: 'paid',   payment_method: 'card',   paid_at: new Date('2024-03-02') },
    { job_card_id: jc2.id, subtotal: 120.00, tax: tax(120),  total: 120.00 + tax(120), payment_status: 'unpaid', payment_method: null,     paid_at: null },
    { job_card_id: jc3.id, subtotal: 220.00, tax: tax(220),  total: 220.00 + tax(220), payment_status: 'unpaid', payment_method: null,     paid_at: null },
    { job_card_id: jc4.id, subtotal: 199.00, tax: tax(199),  total: 199.00 + tax(199), payment_status: 'unpaid', payment_method: null,     paid_at: null },
    { job_card_id: jc5.id, subtotal: 60.00,  tax: tax(60),   total: 60.00  + tax(60),  payment_status: 'unpaid', payment_method: null,     paid_at: null },
  ]);

  console.log('✅ Seed complete. Demo credentials:');
  console.log('   Admin:      admin@vsc.com     / admin123');
  console.log('   Advisor:    advisor@vsc.com   / advisor123');
  console.log('   Technician: tech@vsc.com      / tech123');
  console.log('   Customer:   customer@vsc.com  / customer123');
};
