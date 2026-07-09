const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./teachers.repository');
const timetableRepo = require('../timetable/timetable.repository');
const { hashPassword } = require('../auth/auth.service');

async function list(schoolId, pagination) {
  return repo.findAll(schoolId, pagination);
}

async function getById(id, schoolId) {
  const teacher = await repo.findById(id, schoolId);
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
  return repo.findById(teacher.id, data.school_id);
}

async function update(id, data, schoolId) {
  await getById(id, schoolId);
  const updated = await repo.update(id, data);
  return repo.findById(updated.id, schoolId);
}

async function remove(id, schoolId) {
  await getById(id, schoolId);
  await repo.remove(id, schoolId);
  return { message: 'Teacher deleted successfully' };
}

async function getClasses(id, schoolId) {
  await getById(id, schoolId);
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
    .where('teacher_assignments.teacher_id', id)
    .where('classes.school_id', schoolId);
}

async function getClassTeacherClass(teacherId, schoolId) {
  const teacher = await repo.findById(teacherId, schoolId);
  if (!teacher) throw new ApiError(404, 'Teacher not found');
  return db('classes')
    .select(
      'classes.*',
      'teachers.full_name as class_teacher_name',
      db.raw('(SELECT COUNT(*) FROM students WHERE students.class_id = classes.id) as student_count')
    )
    .leftJoin('teachers', 'classes.class_teacher_id', 'teachers.user_id')
    .where('classes.class_teacher_id', teacher.user_id)
    .where('classes.school_id', schoolId)
    .first();
}

async function getTimetable(id, schoolId) {
  await getById(id, schoolId);
  return timetableRepo.findByTeacher(id, schoolId);
}

async function setSubjects(id, subjectIds, schoolId) {
  await getById(id, schoolId);
  await repo.setSubjects(id, subjectIds);
  return repo.getSubjects(id);
}

module.exports = { list, getById, create, update, remove, getClasses, getClassTeacherClass, getTimetable, setSubjects };
