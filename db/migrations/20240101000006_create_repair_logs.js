export const up = async (knex) => {
  await knex.schema.createTable('repair_logs', (table) => {
    table.increments('id').primary();
    table.integer('job_card_id').notNullable().references('id').inTable('job_cards').onDelete('CASCADE');
    table.integer('updated_by').notNullable().references('id').inTable('users');
    table.specificType('status', 'repair_status').notNullable();
    table.text('notes');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('repair_logs');
};
