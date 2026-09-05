exports.up = function (knex) {
  return knex.schema.alterTable('fee_payments', (t) => {
    t.uuid('transaction_id').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('fee_payments', (t) => {
    t.dropColumn('transaction_id');
  });
};