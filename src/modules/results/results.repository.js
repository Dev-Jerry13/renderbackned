const db = require('../../config/db');

async function findByExamAndSubject(examId, subjectId) {
  return db('results')
    .select(
      'results.*',
      'students.full_name as student_name',
      'students.roll_number'
    )
    .join('students', 'results.student_id', 'students.id')
    .where({ exam_id: examId, subject_id: subjectId })
    .orderBy('students.roll_number');
}

async function findByStudent(studentId) {
  return db('results')
    .select(
      'results.*',
      'exams.name as exam_name',
      'subjects.name as subject_name'
    )
    .join('exams', 'results.exam_id', 'exams.id')
    .join('subjects', 'results.subject_id', 'subjects.id')
    .where('results.student_id', studentId)
    .orderBy('exams.exam_date', 'desc');
}

async function bulkUpsert(records) {
  return db('results')
    .insert(records)
    .onConflict(['exam_id', 'student_id', 'subject_id'])
    .merge();
}

module.exports = { findByExamAndSubject, findByStudent, bulkUpsert };
