exports.up = (knex) =>
  knex.schema.createTable('teacher_subjects', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('teacher_id').references('id').inTable('teachers').onDelete('CASCADE');
    t.uuid('subject_id').references('id').inTable('subjects').onDelete('CASCADE');
    t.unique(['teacher_id', 'subject_id']);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('teacher_subjects');
