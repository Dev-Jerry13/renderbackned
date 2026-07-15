exports.up = function (knex) {
  return knex.schema.createTable('exam_classes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('exam_id').notNullable().references('id').inTable('exams').onDelete('CASCADE');
    t.uuid('class_id').notNullable().references('id').inTable('classes').onDelete('CASCADE');
    t.timestamps(true, true);
    t.unique(['exam_id', 'class_id']);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('exam_classes');
};
