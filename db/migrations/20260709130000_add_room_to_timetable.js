exports.up = function (knex) {
  return knex.schema.alterTable('timetable', (t) => {
    t.string('room', 50).nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('timetable', (t) => {
    t.dropColumn('room');
  });
};
