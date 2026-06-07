const db = require('../../config/db');

function baseQuery() {
  return db('classes')
    .select(
      'classes.*',
      db.raw('COUNT(DISTINCT students.id) as student_count'),
      'teachers.full_name as class_teacher_name'
    )
    .leftJoin('students', 'classes.id', 'students.class_id')
    .leftJoin('teachers', 'classes.class_teacher_id', 'teachers.id')
    .groupBy('classes.id', 'teachers.full_name');
}

async function findAll() {
  return baseQuery().orderBy('classes.name');
}

async function findById(id) {
  return baseQuery().where('classes.id', id).first();
}

async function create(data) {
  const [cls] = await db('classes').insert(data).returning('*');
  return cls;
}

async function update(id, data) {
  const [cls] = await db('classes').where({ id }).update(data).returning('*');
  return cls;
}

module.exports = { findAll, findById, create, update };
