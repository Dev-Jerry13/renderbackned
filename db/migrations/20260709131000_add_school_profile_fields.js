exports.up = function (knex) {
  return knex.schema.alterTable('schools', (t) => {
    t.string('address').nullable();
    t.string('phone', 30).nullable();
    t.string('email').nullable();
    t.string('website').nullable();
    t.string('established_year', 10).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('schools', (t) => {
    t.dropColumn('address');
    t.dropColumn('phone');
    t.dropColumn('email');
    t.dropColumn('website');
    t.dropColumn('established_year');
  });
};
