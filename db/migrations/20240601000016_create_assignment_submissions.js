exports.up = function (knex) {
  return knex.schema.createTable('assignment_submissions', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('assignment_id').references('id').inTable('assignments').onDelete('CASCADE');
    t.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
    t.string('status', 20).notNullable().defaultTo('pending');
    t.text('remarks');
    t.timestamps(true, true);
    t.unique(['assignment_id', 'student_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('assignment_submissions');
};
