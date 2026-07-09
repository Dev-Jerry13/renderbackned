const db = require('../../config/db');
const paginate = require('../../utils/paginate');

const baseSelect = [
  'staff.*',
  'users.email',
];

async function findAll(schoolId, pagination, filters) {
  return paginate((mode) => {
    let q = db('staff')
      .join('users', 'staff.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .select(baseSelect);
    if (filters) {
      if (filters.department) {
        q = q.where('staff.department', filters.department);
      }
      if (filters.is_active !== undefined) {
        q = q.where('staff.is_active', filters.is_active);
      }
    }
    if (mode === 'list') q = q.orderBy('staff.full_name', 'asc');
    return q;
  }, pagination);
}

async function findById(id, schoolId) {
  return db('staff')
    .join('users', 'staff.user_id', 'users.id')
    .where('staff.id', id)
    .where('users.school_id', schoolId)
    .select(baseSelect)
    .first();
}

async function findByUserId(userId) {
  return db('staff').where({ user_id: userId }).first();
}

async function create(data) {
  const [staff] = await db('staff').insert(data).returning('*');
  return staff;
}

async function update(id, data) {
  const [staff] = await db('staff').where({ id }).update(data).returning('*');
  return staff;
}

async function remove(id, schoolId) {
  const staff = await db('staff')
    .join('users', 'staff.user_id', 'users.id')
    .where('staff.id', id)
    .where('users.school_id', schoolId)
    .select('staff.user_id')
    .first();
  if (!staff) return;
  await db('users').where({ id: staff.user_id }).del();
}

async function listDepartments(schoolId) {
  return db('staff')
    .join('users', 'staff.user_id', 'users.id')
    .where('users.school_id', schoolId)
    .whereNotNull('staff.department')
    .distinct('staff.department')
    .orderBy('staff.department');
}

module.exports = { findAll, findById, findByUserId, create, update, remove, listDepartments };
