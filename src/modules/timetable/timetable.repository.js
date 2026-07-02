const db = require('../../config/db');

async function findByClass(classId, schoolId) {
  return db('timetable')
    .select(
      'timetable.*',
      'subjects.name as subject_name',
      'teachers.full_name as teacher_name'
    )
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('teachers', 'timetable.teacher_id', 'teachers.id')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.class_id', classId)
    .where('classes.school_id', schoolId)
    .orderBy('timetable.day')
    .orderBy('timetable.start_time');
}

async function findById(id, schoolId) {
  return db('timetable')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.id', id)
    .where('classes.school_id', schoolId)
    .select('timetable.*')
    .first();
}

async function create(data) {
  const [entry] = await db('timetable').insert(data).returning('*');
  return entry;
}

async function update(id, data, schoolId) {
  const [entry] = await db('timetable')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.id', id)
    .where('classes.school_id', schoolId)
    .select('timetable.*')
    .first();
  if (!entry) return null;
  const [updated] = await db('timetable').where({ id }).update(data).returning('*');
  return updated;
}

async function remove(id, schoolId) {
  const entry = await db('timetable')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.id', id)
    .where('classes.school_id', schoolId)
    .select('timetable.id')
    .first();
  if (!entry) return;
  await db('timetable').where({ id }).del();
}

module.exports = { findByClass, findById, create, update, remove };
