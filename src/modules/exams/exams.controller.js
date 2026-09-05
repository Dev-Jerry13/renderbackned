const examService = require('./exams.service');

async function list(req, res) {
  const { page, limit } = req.query;
  const result = await examService.list(req.user.schoolId, { page, limit });
  res.json(result);
}

async function create(req, res) {
  const exam = await examService.create({
    ...req.validated,
    school_id: req.user.schoolId,
  });
  res.status(201).json(exam);
}

async function getById(req, res) {
  const exam = await examService.getById(req.params.id, req.user.schoolId);
  res.json(exam);
}

async function getClasses(req, res) {
  const classes = await examService.getClasses(req.params.id, req.user.schoolId);
  res.json(classes);
}

async function publish(req, res) {
  const exam = await examService.publish(req.params.id, req.validated.is_published, req.user.schoolId);
  res.json(exam);
}

async function remove(req, res) {
  const result = await examService.remove(req.params.id, req.user.schoolId);
  res.json(result);
}

async function getSubjects(req, res) {
  const result = await examService.getSubjects(req.params.id, req.user.schoolId);
  res.json(result);
}

async function addSubject(req, res) {
  const result = await examService.addSubject(req.params.id, req.validated, req.user.schoolId);
  res.status(201).json(result);
}

async function removeSubject(req, res) {
  const result = await examService.removeSubject(req.params.id, req.params.subjectId, req.user.schoolId);
  res.json(result);
}

module.exports = { list, create, getById, getClasses, publish, remove, getSubjects, addSubject, removeSubject };
