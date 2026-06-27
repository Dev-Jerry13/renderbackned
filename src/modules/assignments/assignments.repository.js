const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(filters, pagination) {
  return paginate((mode) => {
    let q = db('assignments')
      .join('teachers', 'assignments.teacher_id', 'teachers.id')
      .join('subjects', 'assignments.subject_id', 'subjects.id')
      .join('classes', 'assignments.class_id', 'classes.id');

    if (filters?.classId) q = q.where('assignments.class_id', filters.classId);
    if (filters?.subjectId) q = q.where('assignments.subject_id', filters.subjectId);

    if (mode === 'list') {
      q = q.select(
        'assignments.*',
        'teachers.full_name as teacher_name',
        'subjects.name as subject_name',
        'classes.name as class_name',
        'classes.section'
      ).orderBy('assignments.created_at', 'desc');
    }
    return q;
  }, pagination);
}

async function findById(id) {
  return db('assignments').where({ id }).first();
}

async function create(data) {
  const [assignment] = await db('assignments').insert(data).returning('*');
  return assignment;
}

async function update(id, data) {
  const [assignment] = await db('assignments').where({ id }).update(data).returning('*');
  return assignment;
}

async function remove(id) {
  await db('assignments').where({ id }).del();
}

module.exports = { findAll, findById, create, update, remove };
