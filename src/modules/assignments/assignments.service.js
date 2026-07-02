const ApiError = require('../../utils/ApiError');
const repo = require('./assignments.repository');

async function list(filters, pagination, schoolId) {
  return repo.findAll(filters, pagination, schoolId);
}

async function create(data) {
  return repo.create(data);
}

async function update(id, data, schoolId) {
  const assignment = await repo.findById(id, schoolId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return repo.update(id, data, schoolId);
}

async function remove(id, schoolId) {
  const assignment = await repo.findById(id, schoolId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  await repo.remove(id, schoolId);
  return { success: true };
}

module.exports = { list, create, update, remove };
