const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('subjects').where({ school_id: schoolId });
    if (mode === 'list') q = q.select('*').orderBy('name');
    return q;
  }, pagination);
}

async function findById(id) {
  return db('subjects').where({ id }).first();
}

async function create(data) {
  const [subject] = await db('subjects').insert(data).returning('*');
  return subject;
}

async function findAssignments(subjectId) {
  return db('teacher_assignments')
    .select(
      'teacher_assignments.*',
      'teachers.full_name as teacher_name',
      'classes.name as class_name',
      'classes.section'
    )
    .join('teachers', 'teacher_assignments.teacher_id', 'teachers.id')
    .join('classes', 'teacher_assignments.class_id', 'classes.id')
    .where('teacher_assignments.subject_id', subjectId);
}

module.exports = { findAll, findById, create, findAssignments };
