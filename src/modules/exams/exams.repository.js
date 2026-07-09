const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('exams').where({ school_id: schoolId });
    if (mode === 'list') q = q.orderBy('exam_date', 'desc');
    return q;
  }, pagination);
}

async function findById(id, schoolId) {
  return db('exams').where({ id, school_id: schoolId }).first();
}

async function create(data) {
  const [exam] = await db('exams').insert(data).returning('*');
  return exam;
}

async function update(id, data, schoolId) {
  const [exam] = await db('exams').where({ id, school_id: schoolId }).update(data).returning('*');
  return exam;
}

async function remove(id, schoolId) {
  return db('exams').where({ id, school_id: schoolId }).delete();
}

async function findSubjects(examId) {
  return db('exam_subjects')
    .select('exam_subjects.*', 'subjects.name as subject_name')
    .join('subjects', 'exam_subjects.subject_id', 'subjects.id')
    .where('exam_subjects.exam_id', examId)
    .orderBy('subjects.name');
}

async function upsertSubject(examId, data) {
  const existing = await db('exam_subjects')
    .where({ exam_id: examId, subject_id: data.subject_id })
    .first();
  if (existing) {
    const [row] = await db('exam_subjects')
      .where({ id: existing.id })
      .update(data)
      .returning('*');
    return row;
  }
  const [row] = await db('exam_subjects')
    .insert({ ...data, exam_id: examId })
    .returning('*');
  return row;
}

async function removeSubject(examId, subjectId) {
  return db('exam_subjects')
    .where({ exam_id: examId, subject_id: subjectId })
    .del();
}

module.exports = { findAll, findById, create, update, remove, findSubjects, upsertSubject, removeSubject };
