const db = require('../../config/db');

function baseQuery() {
  return db('teachers')
    .select('teachers.*', 'users.email')
    .leftJoin('users', 'teachers.user_id', 'users.id');
}

async function findAll() {
  return baseQuery().orderBy('teachers.full_name');
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

module.exports = { findAll, findById, findByUserId, create, update };
