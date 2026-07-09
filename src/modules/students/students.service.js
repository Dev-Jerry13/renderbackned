const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./students.repository');
const { hashPassword } = require('../auth/auth.service');

async function list(schoolId, pagination) {
  return repo.findAll(schoolId, pagination);
}

async function getById(id, schoolId) {
  const student = await repo.findById(id, schoolId);
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
  return repo.findById(student.id, data.school_id);
}

async function update(id, data, schoolId) {
  await getById(id, schoolId);
  const updated = await repo.update(id, data);
  return repo.findById(updated.id, schoolId);
}

async function remove(id, schoolId) {
  await getById(id, schoolId);
  await repo.remove(id, schoolId);
  return { message: 'Student deleted successfully' };
}

async function activate(id, isActive, schoolId) {
  const student = await getById(id, schoolId);
  await repo.update(id, { is_active: isActive });
  await db('users').where({ id: student.user_id }).update({ is_active: isActive });
  return repo.findById(id, schoolId);
}

async function promote(data, schoolId) {
  const { from_class_id, to_class_id, academic_year, student_ids, status } = data;

  const fromClass = await db('classes').where({ id: from_class_id, school_id: schoolId }).first();
  if (!fromClass) throw new ApiError(404, 'Source class not found');

  const toClass = await db('classes').where({ id: to_class_id, school_id: schoolId }).first();
  if (!toClass) throw new ApiError(404, 'Target class not found');

  const students = await db('students')
    .whereIn('id', student_ids)
    .where('class_id', from_class_id);

  if (students.length !== student_ids.length) {
    throw new ApiError(400, 'Some students not found or not in the source class');
  }

  const historyRecords = students.map((s) => ({
    student_id: s.id,
    class_id: to_class_id,
    academic_year,
    status,
  }));

  await db('student_academic_years').insert(historyRecords);

  await db('students')
    .whereIn('id', student_ids)
    .update({ class_id: to_class_id });

  return {
    message: `Successfully promoted ${students.length} student(s) to ${toClass.name}${toClass.section ? ' - ' + toClass.section : ''}`,
    count: students.length,
  };
}

module.exports = { list, getById, create, update, remove, activate, promote };
