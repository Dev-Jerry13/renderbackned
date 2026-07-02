const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findByExamAndSubject(examId, subjectId, classId, pagination, schoolId) {
  return paginate((mode) => {
    let q = db('results')
      .join('students', 'results.student_id', 'students.id')
      .join('exams', 'results.exam_id', 'exams.id')
      .where({ exam_id: examId, subject_id: subjectId })
      .where('exams.school_id', schoolId);

    if (classId) q = q.where('students.class_id', classId);

    if (mode === 'list') {
      q = q.select(
        'results.*',
        'students.full_name as student_name',
        'students.roll_number'
      ).orderBy('students.roll_number');
    }
    return q;
  }, pagination);
}

async function findByStudent(studentId, schoolId) {
  return db('results')
    .select(
      'results.*',
      'exams.name as exam_name',
      'subjects.name as subject_name'
    )
    .join('exams', 'results.exam_id', 'exams.id')
    .join('subjects', 'results.subject_id', 'subjects.id')
    .where('results.student_id', studentId)
    .where('exams.school_id', schoolId)
    .orderBy('exams.exam_date', 'desc');
}

async function bulkUpsert(records) {
  return db('results')
    .insert(records)
    .onConflict(['exam_id', 'student_id', 'subject_id'])
    .merge();
}

module.exports = { findByExamAndSubject, findByStudent, bulkUpsert };
