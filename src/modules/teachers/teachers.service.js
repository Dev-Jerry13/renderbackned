const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./teachers.repository');
const { hashPassword } = require('../auth/auth.service');

async function list(schoolId, pagination) {
  return repo.findAll(schoolId, pagination);
}

async function getById(id) {
  const teacher = await repo.findById(id);
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  return teacher;
}

async function create(data) {
  const existing = await db('users').where({ email: data.email }).first();
  if (existing) throw new ApiError(409, 'Email already in use');

  const password_hash = await hashPassword(data.password);

  const [user] = await db('users').insert({
    email: data.email,
    password_hash,
    role: 'teacher',
    school_id: data.school_id,
  }).returning('*');

  const teacherData = {
    user_id: user.id,
    full_name: data.full_name,
    phone: data.phone || null,
  };

  const teacher = await repo.create(teacherData);
  return repo.findById(teacher.id);
}

async function update(id, data) {
  await getById(id);
  const updated = await repo.update(id, data);
  return repo.findById(updated.id);
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
  return { message: 'Teacher deleted successfully' };
}

async function getClasses(id) {
  await getById(id);
  return db('teacher_assignments')
    .select(
      'classes.id as class_id',
      'classes.name as class_name',
      'classes.section',
      'classes.class_teacher_id',
      'subjects.id as subject_id',
      'subjects.name as subject_name'
    )
    .join('classes', 'teacher_assignments.class_id', 'classes.id')
    .join('subjects', 'teacher_assignments.subject_id', 'subjects.id')
    .where('teacher_assignments.teacher_id', id);
}

async function getClassTeacherClass(teacherId) {
  const teacher = await repo.findById(teacherId);
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  return db('classes')
    .select(
      'classes.*',
      'teachers.full_name as class_teacher_name',
      db.raw('(SELECT COUNT(*) FROM students WHERE students.class_id = classes.id) as student_count')
    )
    .leftJoin('teachers', 'classes.class_teacher_id', 'teachers.user_id')
    .where('classes.class_teacher_id', teacher.user_id)
    .first();
}

module.exports = { list, getById, create, update, remove, getClasses, getClassTeacherClass };
