exports.up = function (knex) {
  return knex.schema.createTable('holidays', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('school_id').notNullable().references('id').inTable('schools').onDelete('CASCADE');
    table.string('title', 150).notNullable();
    table.text('description');
    table.date('date').notNullable();
    table.enu('type', ['holiday', 'event']).notNullable().defaultTo('holiday');
    table.boolean('is_recurring').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['school_id', 'date']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('holidays');
};
