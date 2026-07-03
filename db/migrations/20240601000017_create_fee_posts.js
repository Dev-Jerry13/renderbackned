exports.up = function (knex) {
  return knex.schema.createTable('fee_posts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
    t.string('title').notNullable();
    t.text('description');
    t.date('due_date');
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('fee_posts');
};
