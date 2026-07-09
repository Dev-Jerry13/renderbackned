exports.up = function (knex) {
  return knex.schema
    .createTable('exam_subjects', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('exam_id').references('id').inTable('exams').onDelete('CASCADE');
      t.uuid('subject_id').references('id').inTable('subjects').onDelete('CASCADE');
      t.decimal('max_marks', 6, 2).notNullable();
      t.decimal('passing_marks', 6, 2);
      t.unique(['exam_id', 'subject_id']);
      t.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('exam_subjects');
};
