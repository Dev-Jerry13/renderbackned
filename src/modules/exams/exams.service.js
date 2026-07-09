const ApiError = require('../../utils/ApiError');
const repo = require('./exams.repository');

async function list(schoolId, pagination) {
  return repo.findAll(schoolId, pagination);
}

async function create(data) {
  return repo.create(data);
}

async function getById(id, schoolId) {
  const exam = await repo.findById(id, schoolId);
  if (!exam) throw new ApiError(404, 'Exam not found');
  return exam;
}

async function publish(id, isPublished, schoolId) {
  await getById(id, schoolId);
  return repo.update(id, { is_published: isPublished }, schoolId);
}

async function remove(id, schoolId) {
  await getById(id, schoolId);
  await repo.remove(id, schoolId);
  return { message: 'Exam deleted successfully' };
}

async function getSubjects(examId, schoolId) {
  await getById(examId, schoolId);
  return repo.findSubjects(examId);
}

async function addSubject(examId, data, schoolId) {
  await getById(examId, schoolId);
  return repo.upsertSubject(examId, data);
}

async function removeSubject(examId, subjectId, schoolId) {
  await getById(examId, schoolId);
  await repo.removeSubject(examId, subjectId);
  return { message: 'Subject removed from exam' };
}

module.exports = { list, create, getById, publish, remove, getSubjects, addSubject, removeSubject };
