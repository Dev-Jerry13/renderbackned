exports.up = (knex) =>
  knex.schema.createTable('teachers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').unique();
    t.string('full_name').notNullable();
    t.string('phone');
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('teachers');
