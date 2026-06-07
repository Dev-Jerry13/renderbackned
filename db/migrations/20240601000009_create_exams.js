exports.up = function (knex) {
  return knex.schema.createTable('exams', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    t.string('name').notNullable();
    t.date('exam_date');
    t.boolean('is_published').defaultTo(false);
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('exams');
};
