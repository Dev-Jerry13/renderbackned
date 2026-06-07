exports.up = (knex) =>
  knex.schema.createTable('classes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('section').notNullable();
    t.uuid('class_teacher_id').references('id').inTable('users').nullable();
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('classes');
