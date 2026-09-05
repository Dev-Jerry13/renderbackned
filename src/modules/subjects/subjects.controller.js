const subjectService = require('./subjects.service');

async function list(req, res) {
  const { page, limit } = req.query;
  const result = await subjectService.list(req.user.schoolId, { page, limit });
  res.json(result);
}

async function create(req, res) {
  const subject = await subjectService.create({
    ...req.validated,
    school_id: req.user.schoolId,
  });
  res.status(201).json(subject);
}

async function assign(req, res) {
  const result = await subjectService.assign(
    req.params.id,
    req.validated.teacher_id,
    req.validated.class_id,
    req.user.schoolId
  );
  res.status(201).json(result);
}

async function listByClass(req, res) {
  const result = await subjectService.listByClass(req.user.schoolId);
  res.json(result);
}

module.exports = { list, create, assign, listByClass };
