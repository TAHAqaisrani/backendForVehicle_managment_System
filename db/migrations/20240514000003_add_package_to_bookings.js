export const up = async (knex) => {
  await knex.schema.table('bookings', (table) => {
    table.integer('package_id').nullable().references('id').inTable('service_packages');
  });
};

export const down = async (knex) => {
  await knex.schema.table('bookings', (table) => {
    table.dropColumn('package_id');
  });
};
