exports.up = function (knex) {
  return knex.schema.createTable('student_remarks', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE');
    t.uuid('teacher_id').notNullable().references('id').inTable('teachers').onDelete('CASCADE');
    t.uuid('student_id').notNullable().references('id').inTable('students').onDelete('CASCADE');
    t.string('type', 20).notNullable().defaultTo('praise');
    t.string('category', 30).nullable();
    t.text('message').notNullable();
    t.boolean('is_read').defaultTo(false);
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('student_remarks');
};
