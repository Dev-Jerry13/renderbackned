exports.up = function (knex) {
  return knex.schema.createTable('attendance', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
    t.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    t.date('date').notNullable();
    t.enum('status', ['present', 'absent', 'late']).notNullable();
    t.uuid('marked_by').references('id').inTable('users');
    t.unique(['student_id', 'date']);
    t.timestamps(true, true);
  }).then(() => {
    return knex.schema.table('attendance', (t) => {
      t.index(['class_id', 'date']);
    });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('attendance');
};
