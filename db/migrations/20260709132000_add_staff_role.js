exports.up = async function (knex) {
  // Some deployments use a native enum type, others use plain text.
  // Only alter the enum if the type actually exists.
  const result = await knex.raw(
    "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role') AS exists"
  );
  if (result.rows[0]?.exists) {
    await knex.raw("ALTER TYPE users_role ADD VALUE IF NOT EXISTS 'staff'");
  }
};

exports.down = async function (knex) {
  // PostgreSQL does not allow removing values from enums easily.
  // If the type doesn't exist there is nothing to undo.
};
