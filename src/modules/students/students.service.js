const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./students.repository');
const { hashPassword } = require('../auth/auth.service');

async function list() {
  return repo.findAll();
}

async function getById(id) {
  const student = await repo.findById(id);
  if (!student) throw new ApiError(404, 'Student not found');
  return student;
}

async function create(data) {
  const existing = await db('users').where({ email: data.email }).first();
  if (existing) throw new ApiError(409, 'Email already in use');

  const password_hash = await hashPassword(data.password);

  const [user] = await db('users').insert({
    email: data.email,
    password_hash,
    role: 'student',
    school_id: data.school_id,
  }).returning('*');

  const studentData = {
    user_id: user.id,
    full_name: data.full_name,
    class_id: data.class_id,
    roll_number: data.roll_number || null,
    dob: data.dob || null,
    parent_name: data.parent_name || null,
    parent_phone: data.parent_phone || null,
    emergency_contact: data.emergency_contact || null,
  };

  const student = await repo.create(studentData);
  return repo.findById(student.id);
}

async function update(id, data) {
  await getById(id);
  const updated = await repo.update(id, data);
  return repo.findById(updated.id);
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
  return { message: 'Student deleted successfully' };
}

async function activate(id, isActive) {
  const student = await getById(id);
  await repo.update(id, { is_active: isActive });
  await db('users').where({ id: student.user_id }).update({ is_active: isActive });
  return repo.findById(id);
}

module.exports = { list, getById, create, update, remove, activate };
