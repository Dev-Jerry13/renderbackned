const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(schoolId, classId, pagination) {
  return paginate((mode) => {
    let q = db('announcements')
      .join('users', 'announcements.created_by', 'users.id')
      .where('announcements.school_id', schoolId);

    if (classId) {
      q = q.andWhere(function () {
        this.where('announcements.class_id', classId).orWhereNull('announcements.class_id');
      });
    } else {
      q = q.whereNull('announcements.class_id');
    }

    if (mode === 'list') {
      q = q.select(
        'announcements.*',
        'users.email as created_by_email'
      ).orderBy('announcements.created_at', 'desc');
    }
    return q;
  }, pagination);
}

async function findById(id) {
  return db('announcements').where({ id }).first();
}

async function create(data) {
  const [announcement] = await db('announcements').insert(data).returning('*');
  return announcement;
}

async function update(id, data) {
  const [announcement] = await db('announcements').where({ id }).update(data).returning('*');
  return announcement;
}

async function findByTeacher(schoolId, teacherId, pagination) {
  return paginate((mode) => {
    let q = db('announcements')
      .join('users', 'announcements.created_by', 'users.id')
      .where('announcements.school_id', schoolId)
      .where('announcements.created_by', teacherId);

    if (mode === 'list') {
      q = q.select(
        'announcements.*',
        'users.email as created_by_email'
      ).orderBy('announcements.created_at', 'desc');
    }
    return q;
  }, pagination);
}

async function remove(id) {
  await db('announcements').where({ id }).del();
}

module.exports = { findAll, findById, findByTeacher, create, update, remove };
