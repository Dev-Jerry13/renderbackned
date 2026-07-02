const db = require('../../config/db');
const paginate = require('../../utils/paginate');

function baseQuery() {
  return db('teachers')
    .select('teachers.*', 'users.email')
    .leftJoin('users', 'teachers.user_id', 'users.id');
}

async function findAll(schoolId, pagination) {
  return paginate((mode, ctx) => {
    let q = baseQuery();
    if (mode === 'count') q = q.clearSelect().clearOrder();
    q = q.where('users.school_id', schoolId);

    if (ctx.search) {
      q = q.where(function () {
        this.where('teachers.full_name', 'iLike', `%${ctx.search}%`)
          .orWhere('users.email', 'iLike', `%${ctx.search}%`);
      });
    }

    if (ctx.filters?.is_active !== undefined) {
      q = q.where('teachers.is_active', ctx.filters.is_active);
    }

    if (mode === 'list') q = q.orderBy('teachers.full_name');
    return q;
  }, pagination);
}

async function findById(id, schoolId) {
  return baseQuery().where('teachers.id', id).where('users.school_id', schoolId).first();
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

async function remove(id, schoolId) {
  const teacher = await db('teachers')
    .join('users', 'teachers.user_id', 'users.id')
    .where('teachers.id', id)
    .where('users.school_id', schoolId)
    .select('teachers.*')
    .first();
  if (teacher) {
    await db('users').where({ id: teacher.user_id }).delete();
  }
  return db('teachers').where({ id }).delete();
}

module.exports = { findAll, findById, findByUserId, create, update, remove };
