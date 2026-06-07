exports.up = (knex) =>
  knex.schema.createTable('subjects', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    t.string('name').notNullable();
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('subjects');
