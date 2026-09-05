const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./staff.repository');
const { hashPassword } = require('../auth/auth.service');

async function list(schoolId, pagination, filters) {
  return repo.findAll(schoolId, pagination, filters);
}

async function getById(id, schoolId) {
  const staff = await repo.findById(id, schoolId);
  if (!staff) throw new ApiError(404, 'Staff member not found');
  return staff;
}

async function create(data) {
  const password_hash = await hashPassword(data.password);

  const staff = await db.transaction(async (trx) => {
    const existing = await trx('users').where({ email: data.email }).first();
    if (existing) throw new ApiError(409, 'Email already in use');

    const [user] = await trx('users').insert({
      email: data.email,
      password_hash,
      role: 'staff',
      school_id: data.school_id,
    }).returning('*');

    const staffData = {
      user_id: user.id,
      full_name: data.full_name,
      phone: data.phone || null,
      department: data.department || null,
      designation: data.designation || null,
      salary: data.salary || null,
      joining_date: data.joining_date || null,
    };

    const [staff] = await trx('staff').insert(staffData).returning('*');
    return staff;
  });

  return repo.findById(staff.id, data.school_id);
}

async function update(id, data, schoolId) {
  await getById(id, schoolId);
  const updated = await repo.update(id, data);
  return repo.findById(updated.id, schoolId);
}

async function remove(id, schoolId) {
  await getById(id, schoolId);
  await repo.remove(id, schoolId);
  return { message: 'Staff member deleted successfully' };
}

async function getDepartments(schoolId) {
  return repo.listDepartments(schoolId);
}

module.exports = { list, getById, create, update, remove, getDepartments };
