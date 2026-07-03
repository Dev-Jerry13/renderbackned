exports.up = function (knex) {
  return knex.schema.alterTable('fee_structures', (t) => {
    t.uuid('fee_post_id').references('id').inTable('fee_posts').onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('fee_structures', (t) => {
    t.dropColumn('fee_post_id');
  });
};
