const db = require('../../config/db');

async function findAll(schoolId, classId) {
  const query = db('announcements')
    .select(
      'announcements.*',
      'users.email as created_by_email'
    )
    .join('users', 'announcements.created_by', 'users.id')
    .where('announcements.school_id', schoolId);

  if (classId) {
    query.andWhere(function () {
      this.where('announcements.class_id', classId).orWhereNull('announcements.class_id');
    });
  } else {
    query.whereNull('announcements.class_id');
  }

  return query.orderBy('announcements.created_at', 'desc');
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

async function remove(id) {
  await db('announcements').where({ id }).del();
}

module.exports = { findAll, findById, create, update, remove };
