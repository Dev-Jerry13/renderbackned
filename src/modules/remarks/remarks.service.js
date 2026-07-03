const ApiError = require('../../utils/ApiError');
const repo = require('./remarks.repository');

async function createRemark(data, teacherId, schoolId) {
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

module.exports = { createRemark, getStudentRemarks, getTeacherRemarks, getRemarksByStudentAndTeacher, markRemarkAsRead };
