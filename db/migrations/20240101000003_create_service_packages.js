export const up = async (knex) => {
  await knex.schema.createTable('service_packages', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.text('description');
    table.decimal('base_price', 10, 2).defaultTo(0);
    table.decimal('estimated_hours', 5, 2).defaultTo(1);
    table.timestamps(true, true);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('service_packages');
};
