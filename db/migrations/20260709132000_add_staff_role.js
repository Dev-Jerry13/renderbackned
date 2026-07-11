exports.up = async function (knex) {
  // Some deployments use a native enum type, others use a CHECK constraint.
  const result = await knex.raw(
    "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role') AS exists"
  );
  if (result.rows[0]?.exists) {
    // Native enum — add 'staff' value
    await knex.raw("ALTER TYPE users_role ADD VALUE IF NOT EXISTS 'staff'");
  } else {
    // CHECK constraint — drop old one and add updated one with 'staff'
    await knex.raw(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conrelid = 'users'::regclass
            AND contype = 'c'
            AND conname LIKE '%role%'
        ) THEN
          ALTER TABLE users DROP CONSTRAINT users_role_check;
        END IF;
        ALTER TABLE users ADD CONSTRAINT users_role_check
          CHECK (role IN ('admin', 'teacher', 'student', 'parent', 'staff'));
        ALTER TABLE users ALTER COLUMN role TYPE varchar(20);
      END
      $$;
    `);
  }
};

exports.down = async function (knex) {
  // PostgreSQL does not allow removing values from enums easily.
};
