exports.up = function (knex) {
  return knex.schema.createTable('timetable', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('class_id').references('id').inTable('classes').onDelete('CASCADE');
    t.uuid('subject_id').references('id').inTable('subjects').onDelete('CASCADE');
    t.uuid('teacher_id').references('id').inTable('teachers').onDelete('CASCADE');
    t.enum('day', ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']).notNullable();
    t.time('start_time').notNullable();
    t.time('end_time').notNullable();
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('timetable');
};
