const ApiError = require('../../utils/ApiError');
const repo = require('./remarks.repository');
const db = require('../../config/db');

async function createRemark(data, teacherId, schoolId) {
  const teacher = await db('teachers')
    .join('users', 'teachers.user_id', 'users.id')
    .where('teachers.id', teacherId)
    .where('users.school_id', schoolId)
    .first();
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  const student = await db('students')
    .join('users', 'students.user_id', 'users.id')
    .where('students.id', data.student_id)
    .where('users.school_id', schoolId)
    .first();
  if (!student) throw new ApiError(404, 'Student not found');

  return repo.create({
    school_id: schoolId,
    teacher_id: teacherId,
    student_id: data.student_id,
    type: data.type,
    category: data.category || null,
    message: data.message,
  });
}

async function getStudentRemarks(studentId, schoolId) {
  return repo.findByStudent(studentId, schoolId);
}

async function getTeacherRemarks(teacherId, schoolId) {
  return repo.findByTeacher(teacherId, schoolId);
}

async function getRemarksByStudentAndTeacher(studentId, teacherId, schoolId) {
  return repo.findByStudentAndTeacher(studentId, teacherId, schoolId);
}

async function markRemarkAsRead(id, studentId, schoolId) {
  const remark = await repo.findById(id, schoolId);
  if (!remark) throw new ApiError(404, 'Remark not found');
  if (remark.student_id !== studentId) {
    throw new ApiError(403, 'You can only mark your own remarks as read');
  }
  return repo.markAsRead(id, studentId);
}

async function updateRemark(id, teacherId, schoolId, data) {
  const remark = await repo.findById(id, schoolId);
  if (!remark) throw new ApiError(404, 'Remark not found');
  if (remark.teacher_id !== teacherId) {
    throw new ApiError(403, 'You can only edit your own remarks');
  }
  const allowed = {};
  if (data.type !== undefined) allowed.type = data.type;
  if (data.category !== undefined) allowed.category = data.category;
  if (data.message !== undefined) allowed.message = data.message;
  return repo.update(id, schoolId, allowed);
}

async function deleteRemark(id, teacherId, schoolId) {
  const remark = await repo.findById(id, schoolId);
  if (!remark) throw new ApiError(404, 'Remark not found');
  if (remark.teacher_id !== teacherId) {
    throw new ApiError(403, 'You can only delete your own remarks');
  }
  return repo.deleteRemark(id, schoolId);
}

module.exports = { createRemark, getStudentRemarks, getTeacherRemarks, getRemarksByStudentAndTeacher, markRemarkAsRead, updateRemark, deleteRemark };
