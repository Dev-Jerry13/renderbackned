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
  const query = baseQuery().where('users.school_id', schoolId).orderBy('students.full_name');
  return paginate(query, pagination);
}

async function findById(id) {
  return baseQuery().where('students.id', id).first();
}

async function findByUserId(userId) {
  return db('students').where({ user_id: userId }).first();
}

async function findByClassId(classId) {
  return baseQuery().where('students.class_id', classId).orderBy('students.roll_number');
}

async function create(data) {
  const [student] = await db('students').insert(data).returning('*');
  return student;
}

async function update(id, data) {
  const [student] = await db('students').where({ id }).update(data).returning('*');
  return student;
}

async function remove(id) {
  const student = await db('students').where({ id }).first();
  if (!student) return 0;
  if (student.user_id) {
    await db('users').where({ id: student.user_id }).delete();
  }
  return db('students').where({ id }).delete();
}

module.exports = { findAll, findById, findByUserId, findByClassId, create, update, remove };
