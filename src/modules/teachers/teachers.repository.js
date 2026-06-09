const db = require('../../config/db');

function baseQuery() {
  return db('teachers')
    .select('teachers.*', 'users.email')
    .leftJoin('users', 'teachers.user_id', 'users.id');
}

async function findAll(schoolId) {
  return baseQuery().where('users.school_id', schoolId).orderBy('teachers.full_name');
}

async function findById(id) {
  return baseQuery().where('teachers.id', id).first();
}

async function findByUserId(userId) {
  return db('teachers').where({ user_id: userId }).first();
}

async function create(data) {
  const [teacher] = await db('teachers').insert(data).returning('*');
  return teacher;
}

async function update(id, data) {
  const [teacher] = await db('teachers').where({ id }).update(data).returning('*');
  return teacher;
}

async function remove(id) {
  const teacher = await db('teachers').where({ id }).first();
  if (teacher) {
    await db('users').where({ id: teacher.user_id }).delete();
  }
  return db('teachers').where({ id }).delete();
}

module.exports = { findAll, findById, findByUserId, create, update, remove };
