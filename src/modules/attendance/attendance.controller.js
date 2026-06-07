const attendanceService = require('./attendance.service');

async function mark(req, res, next) {
  try {
    const result = await attendanceService.markAttendance(req.validated, req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { classId, date } = req.query;
    const records = await attendanceService.getByClassAndDate(classId, date);
    res.json(records);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const record = await attendanceService.update(req.params.id, req.validated);
    res.json(record);
  } catch (err) {
    next(err);
  }
}

module.exports = { mark, list, update };
