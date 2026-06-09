const ApiError = require('../../utils/ApiError');
const repo = require('./exams.repository');

async function list(schoolId) {
  return repo.findAll(schoolId);
}

async function create(data) {
  return repo.create(data);
}

async function getById(id) {
  const exam = await repo.findById(id);
  if (!exam) throw new ApiError(404, 'Exam not found');
  return exam;
}

async function publish(id, isPublished) {
  await getById(id);
  return repo.update(id, { is_published: isPublished });
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
  return { message: 'Exam deleted successfully' };
}

module.exports = { list, create, getById, publish, remove };
