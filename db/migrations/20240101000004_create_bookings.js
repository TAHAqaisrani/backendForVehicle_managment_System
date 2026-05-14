export const up = async (knex) => {
  await knex.raw(`CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled')`);
  await knex.schema.createTable('bookings', (table) => {
    table.increments('id').primary();
    table.integer('customer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('vehicle_id').notNullable().references('id').inTable('vehicles').onDelete('CASCADE');
    table.text('issue_description').notNullable();
    table.date('preferred_date').notNullable();
    table.time('preferred_time');
    table.specificType('status', 'booking_status').notNullable().defaultTo('pending');
    table.timestamps(true, true);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('bookings');
  await knex.raw(`DROP TYPE IF EXISTS booking_status`);
};
