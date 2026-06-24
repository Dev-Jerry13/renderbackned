exports.up = (knex) =>
  knex.schema.raw(
    'CREATE UNIQUE INDEX idx_classes_class_teacher_id ON classes (class_teacher_id) WHERE class_teacher_id IS NOT NULL'
  );

exports.down = (knex) =>
  knex.schema.raw('DROP INDEX IF EXISTS idx_classes_class_teacher_id');
