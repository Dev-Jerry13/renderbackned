const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./results.repository');

async function bulkEntry(data, user) {
  const exam = await db('exams').where({ id: data.examId }).first();
  if (!exam) throw new ApiError(404, 'Exam not found');

  const subject = await db('subjects').where({ id: data.subjectId }).first();
  if (!subject) throw new ApiError(404, 'Subject not found');

  if (user.role === 'teacher') {
    const subjectAssignment = await db('teacher_assignments')
      .where({ teacher_id: user.teacherId, subject_id: data.subjectId })
      .first();
    if (!subjectAssignment) {
      throw new ApiError(403, 'You are not assigned to this subject');
    }

    const teacherClassIds = (
      await db('teacher_assignments')
        .where({ teacher_id: user.teacherId })
        .select('class_id')
    ).map((a) => a.class_id);

    for (const m of data.marks) {
      const student = await db('students').where({ id: m.studentId }).first();
      if (!student) throw new ApiError(404, `Student not found: ${m.studentId}`);
      if (!teacherClassIds.includes(student.class_id)) {
        const studentData = student;
        throw new ApiError(
          403,
          `Student ${studentData.full_name} is not in a class you are assigned to`,
        );
      }
    }
  } else {
    for (const m of data.marks) {
      const student = await db('students').where({ id: m.studentId }).first();
      if (!student) throw new ApiError(404, `Student not found: ${m.studentId}`);
    }
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

async function getByExamAndSubject(examId, subjectId, classId, user) {
  if (user.role === 'teacher') {
    const assignment = await db('teacher_assignments')
      .where({ teacher_id: user.teacherId, subject_id: subjectId, class_id: classId })
      .first();
    if (!assignment) {
      throw new ApiError(403, 'You are not assigned to this class/subject combination');
    }
  }
  return repo.findByExamAndSubject(examId, subjectId, classId);
}

async function getByStudent(studentId) {
  return repo.findByStudent(studentId);
}

module.exports = { bulkEntry, getByExamAndSubject, getByStudent };
