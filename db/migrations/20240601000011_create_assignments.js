exports.up = function (knex) {
  return knex.schema.createTable('assignments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('teacher_id').references('id').inTable('teachers').onDelete('CASCADE');
    t.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    t.uuid('subject_id').references('id').inTable('subjects').onDelete('CASCADE');
    t.string('title').notNullable();
    t.text('description');
    t.date('due_date');
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('assignments');
};
