export const up = async (knex) => {
  await knex.raw(`CREATE TYPE user_role AS ENUM ('customer', 'advisor', 'technician', 'admin')`);
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('email', 150).notNullable().unique();
    table.string('password', 255).notNullable();
    table.specificType('role', 'user_role').notNullable().defaultTo('customer');
    table.string('phone', 20);
    table.timestamps(true, true);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('users');
  await knex.raw(`DROP TYPE IF EXISTS user_role`);
};
