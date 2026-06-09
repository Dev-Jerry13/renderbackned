const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./results.repository');

async function bulkEntry(data) {
  const exam = await db('exams').where({ id: data.examId }).first();
  if (!exam) throw new ApiError(404, 'Exam not found');

  const subject = await db('subjects').where({ id: data.subjectId }).first();
  if (!subject) throw new ApiError(404, 'Subject not found');

  for (const m of data.marks) {
    const student = await db('students').where({ id: m.studentId }).first();
    if (!student) throw new ApiError(404, `Student not found: ${m.studentId}`);
  }

  const records = data.marks.map((m) => ({
    exam_id: data.examId,
    subject_id: data.subjectId,
    student_id: m.studentId,
    marks_obtained: m.marksObtained,
  }));

  await repo.bulkUpsert(records);
  return { success: true };
}

async function getByExamAndSubject(examId, subjectId) {
  return repo.findByExamAndSubject(examId, subjectId);
}

async function getByStudent(studentId) {
  return repo.findByStudent(studentId);
}

module.exports = { bulkEntry, getByExamAndSubject, getByStudent };
