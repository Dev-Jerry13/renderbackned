const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./results.repository');

async function bulkEntry(data, user) {
  const exam = await db('exams').where({ id: data.examId, school_id: user.schoolId }).first();
  if (!exam) throw new ApiError(404, 'Exam not found');

  const subject = await db('subjects').where({ id: data.subjectId, school_id: user.schoolId }).first();
  if (!subject) throw new ApiError(404, 'Subject not found');

  const examSubject = await db('exam_subjects')
    .where({ exam_id: data.examId, subject_id: data.subjectId })
    .first();

  const teacherClassIds = [];
  if (user.role === 'teacher') {
    const subjectAssignment = await db('teacher_assignments')
      .where({ teacher_id: user.teacherId, subject_id: data.subjectId })
      .first();
    if (!subjectAssignment) {
      throw new ApiError(403, 'You are not assigned to this subject');
    }

    teacherClassIds.push(
      ...(await db('teacher_assignments')
        .where({ teacher_id: user.teacherId })
        .select('class_id')).map((a) => a.class_id)
    );
  }

  const studentIds = data.marks.map((m) => m.studentId);
  const students = await db('students')
    .join('users', 'students.user_id', 'users.id')
    .whereIn('students.id', studentIds)
    .where('users.school_id', user.schoolId)
    .select('students.id', 'students.class_id', 'students.full_name');

  const studentMap = new Map(students.map((s) => [s.id, s]));
  for (const m of data.marks) {
    const student = studentMap.get(m.studentId);
    if (!student) throw new ApiError(404, `Student not found: ${m.studentId}`);

    if (examSubject && m.marksObtained > parseFloat(examSubject.max_marks)) {
      throw new ApiError(
        400,
        `Marks for ${student.full_name} exceed the maximum (${examSubject.max_marks})`
      );
    }

    if (user.role === 'teacher' && !teacherClassIds.includes(student.class_id)) {
      throw new ApiError(403, `Student ${student.full_name} is not in a class you are assigned to`);
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

async function getByExamAndSubject(examId, subjectId, classId, user, pagination) {
  if (user.role === 'teacher') {
    const assignment = await db('teacher_assignments')
      .where({ teacher_id: user.teacherId, subject_id: subjectId, class_id: classId })
      .first();
    if (!assignment) {
      throw new ApiError(403, 'You are not assigned to this class/subject combination');
    }
  }
  return repo.findByExamAndSubject(examId, subjectId, classId, pagination, user.schoolId);
}

async function getByStudent(studentId, schoolId) {
  return repo.findByStudent(studentId, schoolId);
}

module.exports = { bulkEntry, getByExamAndSubject, getByStudent };
