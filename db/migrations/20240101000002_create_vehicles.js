export const up = async (knex) => {
  await knex.schema.createTable('vehicles', (table) => {
    table.increments('id').primary();
    table.integer('customer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('make', 50).notNullable();
    table.string('model', 50).notNullable();
    table.integer('year');
    table.string('license_plate', 20).notNullable().unique();
    table.string('color', 30);
    table.integer('mileage').defaultTo(0);
    table.timestamps(true, true);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('vehicles');
};
