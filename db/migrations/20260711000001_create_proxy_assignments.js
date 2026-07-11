exports.up = function (knex) {
  return knex.schema.createTable('proxy_assignments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('timetable_id').notNullable().references('id').inTable('timetable').onDelete('CASCADE');
    t.date('date').notNullable();
    t.uuid('original_teacher_id').notNullable().references('id').inTable('teachers').onDelete('CASCADE');
    t.uuid('proxy_teacher_id').notNullable().references('id').inTable('teachers').onDelete('CASCADE');
    t.uuid('requested_by').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.enum('status', ['pending', 'accepted', 'rejected', 'cancelled']).notNullable().defaultTo('pending');
    t.text('reason');
    t.timestamps(true, true);

    t.unique(['timetable_id', 'date']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('proxy_assignments');
};
