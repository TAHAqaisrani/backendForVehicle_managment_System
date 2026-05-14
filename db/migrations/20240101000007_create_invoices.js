export const up = async (knex) => {
  await knex.raw(`CREATE TYPE payment_status AS ENUM ('unpaid', 'paid')`);
  await knex.raw(`CREATE TYPE payment_method AS ENUM ('cash', 'card', 'online')`);
  await knex.schema.createTable('invoices', (table) => {
    table.increments('id').primary();
    table.integer('job_card_id').notNullable().unique().references('id').inTable('job_cards').onDelete('CASCADE');
    table.decimal('subtotal', 10, 2).notNullable().defaultTo(0);
    table.decimal('tax', 10, 2).notNullable().defaultTo(0);
    table.decimal('total', 10, 2).notNullable().defaultTo(0);
    table.specificType('payment_status', 'payment_status').notNullable().defaultTo('unpaid');
    table.specificType('payment_method', 'payment_method').nullable();
    table.timestamp('paid_at').nullable();
    table.timestamps(true, true);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('invoices');
  await knex.raw(`DROP TYPE IF EXISTS payment_status`);
  await knex.raw(`DROP TYPE IF EXISTS payment_method`);
};
