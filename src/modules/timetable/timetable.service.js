const ApiError = require('../../utils/ApiError');
const repo = require('./timetable.repository');

async function getByClass(classId, schoolId) {
  return repo.findByClass(classId, schoolId);
}

async function create(data) {
  return repo.create(data);
}

async function update(id, data, schoolId) {
  const entry = await repo.findById(id, schoolId);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  return repo.update(id, data, schoolId);
}

async function remove(id, schoolId) {
  const entry = await repo.findById(id, schoolId);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  await repo.remove(id, schoolId);
  return { success: true };
}

module.exports = { getByClass, create, update, remove };
