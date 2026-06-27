const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(schoolId, pagination) {
  const query = db('exams').where({ school_id: schoolId }).orderBy('exam_date', 'desc');
  return paginate(query, pagination);
}

async function findById(id) {
  return db('exams').where({ id }).first();
}

async function create(data) {
  const [exam] = await db('exams').insert(data).returning('*');
  return exam;
}

async function update(id, data) {
  const [exam] = await db('exams').where({ id }).update(data).returning('*');
  return exam;
}

async function remove(id) {
  return db('exams').where({ id }).delete();
}

module.exports = { findAll, findById, create, update, remove };
