const repo = require('./results.repository');

async function bulkEntry(data) {
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
