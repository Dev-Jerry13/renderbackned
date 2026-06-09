const ApiError = require('../../utils/ApiError');
const repo = require('./attendance.repository');

async function markAttendance(data, userId) {
  const records = data.records.map((r) => ({
    student_id: r.studentId,
    class_id: data.classId,
    date: data.date,
    status: r.status,
    marked_by: userId,
  }));

  await repo.bulkUpsert(records);
  return { success: true };
}

async function getByClassAndDate(classId, date) {
  return repo.findByClassAndDate(classId, date);
}

async function getByStudent(studentId, month) {
  return repo.findByStudent(studentId, month);
}

async function update(id, data) {
  const existing = await repo.findById(id);
  if (!existing) throw new ApiError(404, 'Attendance record not found');
  return repo.update(id, data);
}

module.exports = { markAttendance, getByClassAndDate, getByStudent, update };
