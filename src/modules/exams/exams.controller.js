const examService = require('./exams.service');

async function list(req, res, next) {
  try {
    const exams = await examService.list(req.user.schoolId);
    res.json(exams);
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

async function publish(req, res, next) {
  try {
    const exam = await examService.publish(req.params.id, req.validated.is_published);
    res.json(exam);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, publish };
