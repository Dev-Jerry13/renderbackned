const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./subjects.repository');

async function list() {
  return repo.findAll();
}

async function getById(id) {
  const subject = await repo.findById(id);
  if (!subject) throw new ApiError(404, 'Subject not found');
  return subject;
}

async function create(data) {
  return repo.create(data);
}

async function assign(subjectId, teacherId, classId) {
  await getById(subjectId);

  const teacher = await db('teachers').where({ id: teacherId }).first();
  if (!teacher) throw new ApiError(404, 'Teacher not found');

  const cls = await db('classes').where({ id: classId }).first();
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

module.exports = { list, getById, create, assign };
