const db = require('../../config/db');

async function findByClass(classId) {
  return db('timetable')
    .select(
      'timetable.*',
      'subjects.name as subject_name',
      'teachers.full_name as teacher_name'
    )
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('teachers', 'timetable.teacher_id', 'teachers.id')
    .where('timetable.class_id', classId)
    .orderBy('timetable.day')
    .orderBy('timetable.start_time');
}

async function findById(id) {
  return db('timetable').where({ id }).first();
}

async function create(data) {
  const [entry] = await db('timetable').insert(data).returning('*');
  return entry;
}

async function update(id, data) {
  const [entry] = await db('timetable').where({ id }).update(data).returning('*');
  return entry;
}

async function remove(id) {
  await db('timetable').where({ id }).del();
}

module.exports = { findByClass, findById, create, update, remove };
