exports.up = function (knex) {
  return knex.schema
    .createTable('fee_structures', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
      t.string('fee_type').notNullable();
      t.decimal('amount', 10, 2).notNullable();
      t.uuid('class_id').references('id').inTable('classes').onDelete('SET NULL');
      t.timestamps(true, true);
    })
    .createTable('fee_payments', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.uuid('school_id').references('id').inTable('schools').onDelete('CASCADE');
      t.uuid('student_id').references('id').inTable('students').onDelete('CASCADE');
      t.uuid('fee_structure_id').references('id').inTable('fee_structures').onDelete('SET NULL');
      t.decimal('amount_paid', 10, 2).notNullable();
      t.date('payment_date').notNullable();
      t.string('payment_mode');
      t.string('status').defaultTo('paid');
      t.timestamps(true, true);
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('fee_payments').dropTableIfExists('fee_structures');
};
