const db = require('../../config/db');

function baseQuery() {
  return db('classes')
    .select(
      'classes.*',
      db.raw('COUNT(DISTINCT students.id) as student_count'),
      'teachers.full_name as class_teacher_name'
    )
    .leftJoin('students', 'classes.id', 'students.class_id')
    .leftJoin('teachers', 'classes.class_teacher_id', 'teachers.user_id')
    .groupBy('classes.id', 'teachers.full_name');
}

async function findAll(schoolId, pagination) {
  const pageNum = Math.max(1, parseInt(pagination?.page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(pagination?.limit, 10) || 50), 200);
  const offset = (pageNum - 1) * limitNum;

  const { count } = await db('classes')
    .where('classes.school_id', schoolId)
    .count('* as count')
    .first();

  const data = await baseQuery()
    .where('classes.school_id', schoolId)
    .orderBy('classes.name')
    .offset(offset)
    .limit(limitNum);

  const total = parseInt(count, 10);
  return {
    data,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
}

async function findById(id, schoolId) {
  return baseQuery().where('classes.id', id).where('classes.school_id', schoolId).first();
}

async function create(data) {
  const [cls] = await db('classes').insert(data).returning('*');
  return cls;
}

async function update(id, data) {
  const [cls] = await db('classes').where({ id }).update(data).returning('*');
  return cls;
}

module.exports = { findAll, findById, create, update };
