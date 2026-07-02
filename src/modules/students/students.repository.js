const db = require('../../config/db');
const paginate = require('../../utils/paginate');

function baseQuery() {
  return db('students')
    .select(
      'students.*',
      'users.email',
      'classes.name as class_name',
      'classes.section as class_section'
    )
    .leftJoin('users', 'students.user_id', 'users.id')
    .leftJoin('classes', 'students.class_id', 'classes.id');
}

async function findAll(schoolId, pagination) {
  return paginate((mode, ctx) => {
    let q = baseQuery();
    if (mode === 'count') q = q.clearSelect().clearOrder();
    q = q.where('users.school_id', schoolId);

    if (ctx.search) {
      q = q.where(function () {
        this.where('students.full_name', 'iLike', `%${ctx.search}%`)
          .orWhere('users.email', 'iLike', `%${ctx.search}%`)
          .orWhere('students.roll_number', 'iLike', `%${ctx.search}%`);
      });
    }

    if (ctx.filters?.class_id) {
      q = q.where('students.class_id', ctx.filters.class_id);
    }
    if (ctx.filters?.is_active !== undefined) {
      q = q.where('students.is_active', ctx.filters.is_active);
    }

    if (mode === 'list') q = q.orderBy('students.full_name');
    return q;
  }, pagination);
}

async function findById(id, schoolId) {
  return baseQuery().where('students.id', id).where('users.school_id', schoolId).first();
}

async function findByUserId(userId) {
  return db('students').where({ user_id: userId }).first();
}

async function findByClassId(classId, schoolId) {
  return baseQuery().where('students.class_id', classId).where('users.school_id', schoolId).orderBy('students.roll_number');
}

async function findByClassIdPaginated(classId, pagination, schoolId) {
  return paginate((mode, ctx) => {
    let q = baseQuery();
    if (mode === 'count') q = q.clearSelect().clearOrder();
    q = q.where('students.class_id', classId).where('users.school_id', schoolId);

    if (ctx.search) {
      q = q.where(function () {
        this.where('students.full_name', 'iLike', `%${ctx.search}%`)
          .orWhere('users.email', 'iLike', `%${ctx.search}%`)
          .orWhere('students.roll_number', 'iLike', `%${ctx.search}%`);
      });
    }

    if (mode === 'list') q = q.orderBy('students.roll_number');
    return q;
  }, pagination);
}

async function create(data) {
  const [student] = await db('students').insert(data).returning('*');
  return student;
}

async function update(id, data) {
  const [student] = await db('students').where({ id }).update(data).returning('*');
  return student;
}

async function remove(id, schoolId) {
  const student = await db('students')
    .join('users', 'students.user_id', 'users.id')
    .where('students.id', id)
    .where('users.school_id', schoolId)
    .select('students.*', 'users.id as uid')
    .first();
  if (!student) return 0;
  if (student.user_id) {
    await db('users').where({ id: student.user_id }).delete();
  }
  return db('students').where({ id }).delete();
}

module.exports = { findAll, findById, findByUserId, findByClassId, findByClassIdPaginated, create, update, remove };
