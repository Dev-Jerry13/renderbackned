exports.up = function (knex) {
  return knex.schema.createTable('results', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('exam_id').references('id').inTable('exams').onDelete('CASCADE');
    t.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
    t.uuid('subject_id').references('id').inTable('subjects').onDelete('CASCADE');
    t.decimal('marks_obtained', 5, 2);
    t.decimal('total_marks', 5, 2).defaultTo(100);
    t.unique(['exam_id', 'student_id', 'subject_id']);
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('results');
};
