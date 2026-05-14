export const up = async (knex) => {
  await knex.schema.table('job_cards', (table) => {
    table.boolean('is_approved').defaultTo(false);
  });
};

export const down = async (knex) => {
  await knex.schema.table('job_cards', (table) => {
    table.dropColumn('is_approved');
  });
};
