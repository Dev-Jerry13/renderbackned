exports.up = function (knex) {
  return knex.schema.createTable('staff', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE').unique();
    t.string('full_name').notNullable();
    t.string('phone', 30).nullable();
    t.string('department', 100).nullable();
    t.string('designation', 100).nullable();
    t.decimal('salary', 12, 2).nullable();
    t.date('joining_date').nullable();
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('staff');
};
