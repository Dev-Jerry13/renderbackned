const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('holidays').where({ school_id: schoolId });
    if (mode === 'list') q = q.orderBy('date', 'asc');
    return q;
  }, pagination);
}

async function findById(id, schoolId) {
  return db('holidays').where({ id, school_id: schoolId }).first();
}

async function findByDateRange(schoolId, startDate, endDate) {
  return db('holidays')
    .where({ school_id: schoolId })
    .whereBetween('date', [startDate, endDate])
    .orderBy('date', 'asc');
}

async function create(data) {
  const [holiday] = await db('holidays').insert(data).returning('*');
  return holiday;
}

async function update(id, data, schoolId) {
  const [holiday] = await db('holidays').where({ id, school_id: schoolId }).update(data).returning('*');
  return holiday;
}

async function remove(id, schoolId) {
  return db('holidays').where({ id, school_id: schoolId }).delete();
}

module.exports = { findAll, findById, findByDateRange, create, update, remove };
