const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('exams').where({ school_id: schoolId });
    if (mode === 'list') q = q.orderBy('exam_date', 'desc');
    return q;
  }, pagination);
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
