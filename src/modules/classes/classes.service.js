const ApiError = require('../../utils/ApiError');
const repo = require('./classes.repository');
const studentRepo = require('../students/students.repository');
const timetableRepo = require('../timetable/timetable.repository');

async function list() {
  return repo.findAll();
}

async function getById(id) {
  const cls = await repo.findById(id);
  if (!cls) throw new ApiError(404, 'Class not found');
  return cls;
}

async function create(data) {
  return repo.create(data);
}

async function update(id, data) {
  await getById(id);
  return repo.update(id, data);
}

async function getStudents(id) {
  await getById(id);
  return studentRepo.findByClassId(id);
}

async function getTimetable(id) {
  await getById(id);
  return timetableRepo.findByClass(id);
}

module.exports = { list, getById, create, update, getStudents, getTimetable };
