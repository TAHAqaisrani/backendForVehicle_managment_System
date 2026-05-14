export const up = async (knex) => {
  // Use raw SQL to add the value to the enum type
  await knex.raw("ALTER TYPE repair_status ADD VALUE IF NOT EXISTS 'returned_to_advisor'");
  await knex.raw("ALTER TYPE repair_status ADD VALUE IF NOT EXISTS 'returned_to_customer'");
};

export const down = async (knex) => {
  // Removing enum values is complex in Postgres and usually not necessary for rollback
};
