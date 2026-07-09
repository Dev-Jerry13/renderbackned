const ApiError = require('../../utils/ApiError');
const repo = require('./timetable.repository');

async function getByClass(classId, schoolId) {
  return repo.findByClass(classId, schoolId);
}

async function getByTeacher(teacherId, schoolId) {
  return repo.findByTeacher(teacherId, schoolId);
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

async function create(data) {
  await _checkConflicts(data);
  return repo.create(data);
}

async function update(id, data, schoolId) {
  const entry = await repo.findById(id, schoolId);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  const merged = { ...entry, ...data };
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
