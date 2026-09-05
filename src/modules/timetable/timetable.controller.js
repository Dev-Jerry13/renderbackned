const timetableService = require('./timetable.service');

async function list(req, res) {
  const { classId, teacherId, date } = req.query;
  if (teacherId) {
    const entries = await timetableService.getByTeacher(teacherId, req.user.schoolId, date);
    return res.json(entries);
  }
  if (!classId) {
    return res.status(400).json({ error: 'classId or teacherId query parameter is required' });
  }
  const entries = await timetableService.getByClass(classId, req.user.schoolId, date);
  res.json(entries);
}

async function create(req, res) {
  const entry = await timetableService.create(req.validated, req.user.schoolId);
  res.status(201).json(entry);
}

async function update(req, res) {
  const entry = await timetableService.update(req.params.id, req.validated, req.user.schoolId);
  res.json(entry);
}

async function remove(req, res) {
  const result = await timetableService.remove(req.params.id, req.user.schoolId);
  res.json(result);
}

module.exports = { list, create, update, remove };
