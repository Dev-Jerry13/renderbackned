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

async function getClasses(req, res, next) {
  try {
    const classes = await examService.getClasses(req.params.id, req.user.schoolId);
    res.json(classes);
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

async function getSubjects(req, res, next) {
  try {
    const result = await examService.getSubjects(req.params.id, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function addSubject(req, res, next) {
  try {
    const result = await examService.addSubject(req.params.id, req.validated, req.user.schoolId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function removeSubject(req, res, next) {
  try {
    const result = await examService.removeSubject(req.params.id, req.params.subjectId, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, getClasses, publish, remove, getSubjects, addSubject, removeSubject };
