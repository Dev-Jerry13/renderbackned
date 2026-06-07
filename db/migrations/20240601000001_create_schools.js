exports.up = (knex) =>
  knex.schema.createTable('schools', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.string('logo_url');
    t.string('academic_year');
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('schools');
