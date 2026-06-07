const ApiError = require('../../utils/ApiError');
const repo = require('./timetable.repository');

async function getByClass(classId) {
  return repo.findByClass(classId);
}

async function create(data) {
  return repo.create(data);
}

async function update(id, data) {
  const entry = await repo.findById(id);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  return repo.update(id, data);
}

async function remove(id) {
  const entry = await repo.findById(id);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  await repo.remove(id);
  return { success: true };
}

module.exports = { getByClass, create, update, remove };
