exports.up = (knex) =>
  knex.schema.createTable('students', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    t.uuid('class_id').references('id').inTable('classes').onDelete('SET NULL');
    t.string('roll_number');
    t.string('full_name').notNullable();
    t.date('dob');
    t.string('parent_name');
    t.string('parent_phone');
    t.string('emergency_contact');
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });

exports.down = (knex) => knex.schema.dropTableIfExists('students');
