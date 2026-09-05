const studentService = require('./students.service');

async function list(req, res) {
  const { page, limit, search, class_id, is_active } = req.query;
  const filters = {};
  if (class_id) filters.class_id = class_id;
  if (is_active !== undefined) filters.is_active = is_active === 'true';
  const result = await studentService.list(req.user.schoolId, { page, limit, search, filters });
  res.json(result);
}

async function create(req, res) {
  const student = await studentService.create({
    ...req.validated,
    school_id: req.user.schoolId,
  });
  res.status(201).json(student);
}

async function getById(req, res) {
  const student = await studentService.getById(req.params.id, req.user.schoolId);
  res.json(student);
}

async function update(req, res) {
  const student = await studentService.update(req.params.id, req.validated, req.user.schoolId);
  res.json(student);
}

async function remove(req, res) {
  const result = await studentService.remove(req.params.id, req.user.schoolId);
  res.json(result);
}

async function activate(req, res) {
  const isActive = req.validated.is_active !== false;
  const student = await studentService.activate(req.params.id, isActive, req.user.schoolId);
  res.json(student);
}

async function promote(req, res) {
  const result = await studentService.promote(req.validated, req.user.schoolId);
  res.json(result);
}

module.exports = { list, create, getById, update, remove, activate, promote };
