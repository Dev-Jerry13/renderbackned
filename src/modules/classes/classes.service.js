const ApiError = require('../../utils/ApiError');
const db = require('../../config/db');
const repo = require('./classes.repository');
const studentRepo = require('../students/students.repository');
const timetableRepo = require('../timetable/timetable.repository');

async function list(schoolId) {
  return repo.findAll(schoolId);
}

async function getById(id) {
  const cls = await repo.findById(id);
  if (!cls) throw new ApiError(404, 'Class not found');
  return cls;
}

async function create(data) {
  if (!data.school_id) {
    throw new ApiError(400, 'School ID is required. Ensure your admin account is linked to a school.');
  }
  const school = await db('schools').where({ id: data.school_id }).first();
  if (!school) {
    throw new ApiError(400, 'School not found. Please contact support.');
  }
  if (data.class_teacher_id) {
    const teacherUser = await db('users').where({ id: data.class_teacher_id }).first();
    if (!teacherUser) {
      throw new ApiError(400, 'Selected class teacher not found in users table.');
    }
  }
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
