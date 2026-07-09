const gradingService = require('./grading.service');

async function list(req, res, next) {
  try {
    const result = await gradingService.list(req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const result = await gradingService.getById(req.params.id, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await gradingService.create(req.validated, req.user.schoolId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const result = await gradingService.update(req.params.id, req.validated, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await gradingService.remove(req.params.id, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function findGrade(req, res, next) {
  try {
    const percentage = parseFloat(req.query.percentage);
    if (isNaN(percentage)) return res.status(400).json({ error: 'percentage query param is required' });
    const result = await gradingService.findGrade(req.user.schoolId, percentage);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, findGrade };
