const gradingService = require('./grading.service');

async function list(req, res) {
  const result = await gradingService.list(req.user.schoolId);
  res.json(result);
}

async function getById(req, res) {
  const result = await gradingService.getById(req.params.id, req.user.schoolId);
  res.json(result);
}

async function create(req, res) {
  const result = await gradingService.create(req.validated, req.user.schoolId);
  res.status(201).json(result);
}

async function update(req, res) {
  const result = await gradingService.update(req.params.id, req.validated, req.user.schoolId);
  res.json(result);
}

async function remove(req, res) {
  const result = await gradingService.remove(req.params.id, req.user.schoolId);
  res.json(result);
}

async function findGrade(req, res) {
  const percentage = parseFloat(req.query.percentage);
  if (isNaN(percentage)) return res.status(400).json({ error: 'percentage query param is required' });
  const result = await gradingService.findGrade(req.user.schoolId, percentage);
  res.json(result);
}

module.exports = { list, getById, create, update, remove, findGrade };
