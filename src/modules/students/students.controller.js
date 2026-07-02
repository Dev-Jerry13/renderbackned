const studentService = require('./students.service');

async function list(req, res, next) {
  try {
    const { page, limit, search, class_id, is_active } = req.query;
    const filters = {};
    if (class_id) filters.class_id = class_id;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    const result = await studentService.list(req.user.schoolId, { page, limit, search, filters });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const student = await studentService.create({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const student = await studentService.getById(req.params.id, req.user.schoolId);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const student = await studentService.update(req.params.id, req.validated, req.user.schoolId);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await studentService.remove(req.params.id, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function activate(req, res, next) {
  try {
    const isActive = req.body.is_active !== false;
    const student = await studentService.activate(req.params.id, isActive, req.user.schoolId);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update, remove, activate };
