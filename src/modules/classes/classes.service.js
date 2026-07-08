const ApiError = require('../../utils/ApiError');
const db = require('../../config/db');
const repo = require('./classes.repository');
const studentRepo = require('../students/students.repository');
const timetableRepo = require('../timetable/timetable.repository');

async function list(schoolId, pagination) {
  return repo.findAll(schoolId, pagination);
}

async function getById(id, schoolId) {
  const cls = await repo.findById(id, schoolId);
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
    const existing = await db('classes')
      .where({ class_teacher_id: data.class_teacher_id })
      .first();
    if (existing) {
      throw new ApiError(409, 'This teacher is already the class teacher of another class.');
    }
  }
  return repo.create(data);
}

async function update(id, data, schoolId) {
  await getById(id, schoolId);
  if (data.class_teacher_id) {
    const existing = await db('classes')
      .where({ class_teacher_id: data.class_teacher_id })
      .whereNot('id', id)
      .first();
    if (existing) {
      throw new ApiError(409, 'This teacher is already the class teacher of another class.');
    }
  }
  return repo.update(id, data);
}

async function getStudents(id, pagination = {}, schoolId) {
  await getById(id, schoolId);
  if (pagination.page || pagination.limit) {
    return studentRepo.findByClassIdPaginated(id, pagination, schoolId);
  }
  return studentRepo.findByClassId(id, schoolId);
}

async function getTimetable(id, schoolId) {
  await getById(id, schoolId);
  return timetableRepo.findByClass(id, schoolId);
}

module.exports = { list, getById, create, update, getStudents, getTimetable };
