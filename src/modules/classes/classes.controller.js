const classService = require('./classes.service');

async function list(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await classService.list(req.user.schoolId, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const cls = await classService.create({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(cls);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const cls = await classService.update(req.params.id, req.validated, req.user.schoolId);
    res.json(cls);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const cls = await classService.getById(req.params.id, req.user.schoolId);
    res.json(cls);
  } catch (err) {
    next(err);
  }
}

async function getStudents(req, res, next) {
  try {
    const { page, limit, search } = req.query;
    const result = await classService.getStudents(req.params.id, { page, limit, search }, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getTimetable(req, res, next) {
  try {
    const { date } = req.query;
    const timetable = await classService.getTimetable(req.params.id, req.user.schoolId, date);
    res.json(timetable);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update, getStudents, getTimetable };
