const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('exams')
      .select(
        'exams.*',
        db.raw(`COALESCE(
          (SELECT json_agg(json_build_object('id', c.id, 'name', c.name, 'section', c.section))
           FROM exam_classes ec
           JOIN classes c ON ec.class_id = c.id
           WHERE ec.exam_id = exams.id),
          '[]'::json
        ) as classes`)
      )
      .where('exams.school_id', schoolId);
    if (mode === 'list') q = q.orderBy('exams.exam_date', 'desc');
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

async function assignClasses(examId, classIds) {
  if (!classIds || classIds.length === 0) return [];
  const rows = classIds.map((classId) => ({
    exam_id: examId,
    class_id: classId,
  }));
  return db('exam_classes').insert(rows).returning('*');
}

async function findClasses(examId) {
  return db('exam_classes')
    .select('classes.id', 'classes.name', 'classes.section')
    .join('classes', 'exam_classes.class_id', 'classes.id')
    .where('exam_classes.exam_id', examId)
    .orderBy('classes.name');
}

async function removeClasses(examId) {
  return db('exam_classes').where({ exam_id: examId }).del();
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

module.exports = { findAll, findById, create, assignClasses, findClasses, removeClasses, update, remove, findSubjects, upsertSubject, removeSubject };
