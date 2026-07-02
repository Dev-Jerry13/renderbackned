const ApiError = require('../../utils/ApiError');
const repo = require('./announcements.repository');

async function list(schoolId, classId, pagination) {
  return repo.findAll(schoolId, classId || null, pagination);
}

async function create(data) {
  return repo.create(data);
}

async function update(id, data, schoolId) {
  const announcement = await repo.findById(id, schoolId);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  return repo.update(id, data);
}

async function listByTeacher(schoolId, teacherId, pagination) {
  return repo.findByTeacher(schoolId, teacherId, pagination);
}

async function remove(id, schoolId) {
  const announcement = await repo.findById(id, schoolId);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  await repo.remove(id, schoolId);
  return { success: true };
}

module.exports = { list, create, update, listByTeacher, remove };
