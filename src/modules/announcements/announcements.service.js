const ApiError = require('../../utils/ApiError');
const repo = require('./announcements.repository');

async function list(schoolId, classId) {
  return repo.findAll(schoolId, classId || null);
}

async function create(data) {
  return repo.create(data);
}

async function update(id, data) {
  const announcement = await repo.findById(id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  return repo.update(id, data);
}

async function remove(id) {
  const announcement = await repo.findById(id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  await repo.remove(id);
  return { success: true };
}

module.exports = { list, create, update, remove };
