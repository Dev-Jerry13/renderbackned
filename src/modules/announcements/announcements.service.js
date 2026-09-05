const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./announcements.repository');

async function list(schoolId, classId, pagination) {
  return repo.findAll(schoolId, classId || null, pagination);
}

async function getById(id, schoolId) {
  const announcement = await repo.findById(id, schoolId);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  return announcement;
}

async function _assertTeacherClassAccess(user, classId) {
  if (user.role !== 'teacher' || !classId) return;

  const cls = await db('classes').where({ id: classId, school_id: user.schoolId }).first();
  if (!cls) throw new ApiError(404, 'Class not found');

  const isAssigned = await db('teacher_assignments')
    .where({ teacher_id: user.teacherId, class_id: classId })
    .first();
  const isClassTeacher = cls.class_teacher_id === user.userId;

  if (!isAssigned && !isClassTeacher) {
    throw new ApiError(403, 'You can only announce to classes you teach');
  }
}

async function create(data, user) {
  await _assertTeacherClassAccess(user, data.class_id);
  return repo.create(data);
}

async function update(id, data, user) {
  const announcement = await repo.findById(id, user.schoolId);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  if (user.role !== 'admin' && announcement.created_by !== user.userId) {
    throw new ApiError(403, 'Only the author or an admin can update this announcement');
  }
  return repo.update(id, data);
}

async function listByTeacher(schoolId, teacherId, pagination) {
  const teacher = await db('teachers').where({ id: teacherId, school_id: schoolId }).first();
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  return repo.findByTeacher(schoolId, teacher.user_id, pagination);
}

async function remove(id, user) {
  const announcement = await repo.findById(id, user.schoolId);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  if (user.role !== 'admin' && announcement.created_by !== user.userId) {
    throw new ApiError(403, 'Only the author or an admin can delete this announcement');
  }
  await repo.remove(id, user.schoolId);
  return { success: true };
}

module.exports = { list, getById, create, update, listByTeacher, remove };