exports.up = function (knex) {
  return knex.schema.alterTable('student_academic_years', (t) => {
    t.unique(['student_id', 'academic_year']);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('student_academic_years', (t) => {
    t.dropUnique(['student_id', 'academic_year']);
  });
};