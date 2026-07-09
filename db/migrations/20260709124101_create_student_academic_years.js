exports.up = function (knex) {
  return knex.schema.createTable('student_academic_years', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
    t.uuid('class_id').references('id').inTable('classes').onDelete('SET NULL');
    t.string('academic_year').notNullable();
    t.string('status').defaultTo('promoted');
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('student_academic_years');
};
