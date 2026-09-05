const ApiError = require('../../utils/ApiError');
const db = require('../../config/db');
const repo = require('./attendance.repository');

async function markAttendance(data, user) {
  if (user.role === 'teacher') {
    const assignment = await db('teacher_assignments')
      .where({ teacher_id: user.teacherId, class_id: data.classId })
      .first();
    if (!assignment) {
      throw new ApiError(403, 'You are not assigned to this class');
    }
  }

  const studentIds = data.records.map((r) => r.studentId);
  const validStudents = await db('students')
    .join('users', 'students.user_id', 'users.id')
    .whereIn('students.id', studentIds)
    .where('students.class_id', data.classId)
    .where('users.school_id', user.schoolId)
    .select('students.id');

  if (validStudents.length !== new Set(studentIds).size) {
    throw new ApiError(400, 'One or more students not found in this class');
  }

  const records = data.records.map((r) => ({
    student_id: r.studentId,
    class_id: data.classId,
    date: data.date,
    status: r.status,
    marked_by: user.userId,
  }));

  await repo.bulkUpsert(records);
  return { success: true };
}

async function getByClassAndDate(classId, date, user) {
  if (user.role === 'teacher') {
    const assignment = await db('teacher_assignments')
      .where({ teacher_id: user.teacherId, class_id: classId })
      .first();
    if (!assignment) {
      throw new ApiError(403, 'You are not assigned to this class');
    }
  }
  return repo.findByClassAndDate(classId, date, user.schoolId);
}

async function getByStudent(studentId, month, schoolId) {
  return repo.findByStudent(studentId, month, schoolId);
}

async function update(id, data, schoolId) {
  const existing = await repo.findById(id, schoolId);
  if (!existing) throw new ApiError(404, 'Attendance record not found');
  return repo.update(id, data);
}

module.exports = { markAttendance, getByClassAndDate, getByStudent, update };
