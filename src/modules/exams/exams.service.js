const ApiError = require('../../utils/ApiError');
const repo = require('./exams.repository');

async function list(schoolId) {
  return repo.findAll(schoolId);
}

async function create(data) {
  return repo.create(data);
}

async function publish(id, isPublished) {
  const exam = await repo.findById(id);
  if (!exam) throw new ApiError(404, 'Exam not found');
  return repo.update(id, { is_published: isPublished });
}

module.exports = { list, create, publish };
