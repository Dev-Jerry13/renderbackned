const attendanceService = require('./attendance.service');

async function mark(req, res) {
  const result = await attendanceService.markAttendance(req.validated, req.user);
  res.json(result);
}

async function list(req, res) {
  const { classId, date } = req.query;
  const records = await attendanceService.getByClassAndDate(classId, date, req.user);
  res.json(records);
}

async function getByStudent(req, res) {
  const { month } = req.query;
  const records = await attendanceService.getByStudent(req.params.id, month, req.user.schoolId);
  res.json(records);
}

async function update(req, res) {
  const record = await attendanceService.update(req.params.id, req.validated, req.user.schoolId);
  res.json(record);
}

module.exports = { mark, list, getByStudent, update };
