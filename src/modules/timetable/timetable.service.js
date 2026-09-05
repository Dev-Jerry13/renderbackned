const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const repo = require('./timetable.repository');

async function getByClass(classId, schoolId, date) {
  return repo.findByClass(classId, schoolId, date);
}

async function getByTeacher(teacherId, schoolId, date) {
  return repo.findByTeacher(teacherId, schoolId, date);
}

async function _checkConflicts(data, excludeId) {
  const conflicts = await repo.findConflicts(data, excludeId);
  if (conflicts.length > 0) {
    const details = conflicts.map((c) =>
      `ID ${c.id} (${c.day} ${c.start_time}-${c.end_time})`
    );
    throw new ApiError(409, `Time conflict with existing entry: ${details.join(', ')}`);
  }
}

async function _assertSameSchool(schoolId, classId, subjectId, teacherId) {
  const [cls, subject, teacher] = await Promise.all([
    db('classes').where({ id: classId, school_id: schoolId }).first(),
    db('subjects').where({ id: subjectId, school_id: schoolId }).first(),
    db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .where('teachers.id', teacherId)
      .where('users.school_id', schoolId)
      .first(),
  ]);

  if (!cls) throw new ApiError(404, 'Class not found');
  if (!subject) throw new ApiError(404, 'Subject not found');
  if (!teacher) throw new ApiError(404, 'Teacher not found');
}

async function create(data, schoolId) {
  await _assertSameSchool(schoolId, data.class_id, data.subject_id, data.teacher_id);
  await _checkConflicts(data);
  return repo.create(data);
}

async function update(id, data, schoolId) {
  const entry = await repo.findById(id, schoolId);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  const merged = { ...entry, ...data };
  await _assertSameSchool(schoolId, merged.class_id, merged.subject_id, merged.teacher_id);
  await _checkConflicts(merged, id);
  return repo.update(id, data, schoolId);
}

async function remove(id, schoolId) {
  const entry = await repo.findById(id, schoolId);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  await repo.remove(id, schoolId);
  return { success: true };
}

module.exports = { getByClass, getByTeacher, create, update, remove };