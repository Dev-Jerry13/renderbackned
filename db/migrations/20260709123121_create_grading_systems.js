exports.up = function (knex) {
  return knex.schema
    .createTable('grading_systems', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
      t.string('name').notNullable();
      t.boolean('is_active').defaultTo(true);
      t.timestamps(true, true);
    })
    .createTable('grading_ranges', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('grading_system_id').references('id').inTable('grading_systems').onDelete('CASCADE');
      t.string('grade').notNullable();
      t.decimal('min_percentage', 5, 2).notNullable();
      t.decimal('max_percentage', 5, 2).notNullable();
      t.decimal('grade_point', 4, 2);
      t.string('description');
      t.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('grading_ranges').dropTableIfExists('grading_systems');
};
