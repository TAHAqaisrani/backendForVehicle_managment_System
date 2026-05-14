export const up = async (knex) => {
  await knex.raw(`CREATE TYPE repair_status AS ENUM ('booked','inspected','in_service','waiting_for_parts','ready_for_pickup','delivered')`);
  await knex.schema.createTable('job_cards', (table) => {
    table.increments('id').primary();
    table.integer('booking_id').notNullable().unique().references('id').inTable('bookings').onDelete('CASCADE');
    table.integer('advisor_id').notNullable().references('id').inTable('users');
    table.integer('technician_id').nullable().references('id').inTable('users');
    table.integer('package_id').nullable().references('id').inTable('service_packages');
    table.specificType('repair_status', 'repair_status').notNullable().defaultTo('booked');
    table.text('inspection_notes');
    table.decimal('estimated_cost', 10, 2).defaultTo(0);
    table.decimal('actual_cost', 10, 2).defaultTo(0);
    table.timestamps(true, true);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('job_cards');
  await knex.raw(`DROP TYPE IF EXISTS repair_status`);
};
