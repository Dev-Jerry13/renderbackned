exports.up = function (knex) {
  return knex.schema.createTable('announcements', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    t.uuid('created_by').references('id').inTable('users');
    t.string('title').notNullable();
    t.text('body');
    t.uuid('class_id').references('id').inTable('classes').nullable();
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('announcements');
};
