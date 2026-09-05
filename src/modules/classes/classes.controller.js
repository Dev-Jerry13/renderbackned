const classService = require('./classes.service');

async function list(req, res) {
  const { page, limit } = req.query;
  const result = await classService.list(req.user.schoolId, { page, limit });
  res.json(result);
}

async function create(req, res) {
  const cls = await classService.create({
    ...req.validated,
    school_id: req.user.schoolId,
  });
  res.status(201).json(cls);
}

async function update(req, res) {
  const cls = await classService.update(req.params.id, req.validated, req.user.schoolId);
  res.json(cls);
}

async function getById(req, res) {
  const cls = await classService.getById(req.params.id, req.user.schoolId);
  res.json(cls);
}

async function getStudents(req, res) {
  const { page, limit, search } = req.query;
  const result = await classService.getStudents(req.params.id, { page, limit, search }, req.user.schoolId);
  res.json(result);
}

async function getTimetable(req, res) {
  const { date } = req.query;
  const timetable = await classService.getTimetable(req.params.id, req.user.schoolId, date);
  res.json(timetable);
}

module.exports = { list, create, getById, update, getStudents, getTimetable };
