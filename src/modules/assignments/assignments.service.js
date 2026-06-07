const ApiError = require('../../utils/ApiError');
const repo = require('./assignments.repository');

async function list(filters) {
  return repo.findAll(filters);
}

async function create(data) {
  return repo.create(data);
}

async function update(id, data) {
  const assignment = await repo.findById(id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return repo.update(id, data);
}

async function remove(id) {
  const assignment = await repo.findById(id);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  await repo.remove(id);
  return { success: true };
}

module.exports = { list, create, update, remove };
