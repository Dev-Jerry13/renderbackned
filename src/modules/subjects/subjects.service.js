const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./subjects.repository');

async function list(schoolId, pagination) {
  return repo.findAll(schoolId, pagination);
}

async function getById(id, schoolId) {
  const subject = await repo.findById(id, schoolId);
  if (!subject) throw new ApiError(404, 'Subject not found');
  return subject;
}

async function create(data) {
  return repo.create(data);
}

async function assign(subjectId, teacherId, classId, schoolId) {
  await getById(subjectId, schoolId);

  const teacher = await db('teachers')
    .join('users', 'teachers.user_id', 'users.id')
    .where('teachers.id', teacherId)
    .where('users.school_id', schoolId)
    .first();
  if (!teacher) throw new ApiError(404, 'Teacher not found in this school');

  const cls = await db('classes').where({ id: classId, school_id: schoolId }).first();
  if (!cls) throw new ApiError(404, 'Class not found');

  const existing = await db('teacher_assignments')
    .where({ teacher_id: teacherId, class_id: classId, subject_id: subjectId })
    .first();
  if (existing) throw new ApiError(409, 'Assignment already exists');

  const [assignment] = await db('teacher_assignments').insert({
    teacher_id: teacherId,
    class_id: classId,
    subject_id: subjectId,
  }).returning('*');

  return assignment;
}

async function listByClass(schoolId) {
  return repo.findByClass(schoolId);
}

module.exports = { list, getById, create, assign, listByClass };
