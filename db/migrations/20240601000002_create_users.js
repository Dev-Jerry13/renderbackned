exports.up = (knex) =>
  knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    t.string('email').unique().notNullable();
    t.string('password_hash').notNullable();
    t.enum('role', ['admin', 'teacher', 'student', 'parent']).notNullable();
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('users');
