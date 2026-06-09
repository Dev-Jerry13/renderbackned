const db = require('../../config/db');

async function findAll(schoolId) {
  return db('exams').where({ school_id: schoolId }).orderBy('exam_date', 'desc');
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
