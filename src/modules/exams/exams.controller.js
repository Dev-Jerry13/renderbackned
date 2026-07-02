const examService = require('./exams.service');

async function list(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await examService.list(req.user.schoolId, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const exam = await examService.create({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(exam);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const exam = await examService.getById(req.params.id, req.user.schoolId);
    res.json(exam);
  } catch (err) {
    next(err);
  }
}

async function publish(req, res, next) {
  try {
    const exam = await examService.publish(req.params.id, req.validated.is_published, req.user.schoolId);
    res.json(exam);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await examService.remove(req.params.id, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, publish, remove };
