const teacherService = require('./teachers.service');

async function list(req, res, next) {
  try {
    const teachers = await teacherService.list();
    res.json(teachers);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const teacher = await teacherService.create({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(teacher);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const teacher = await teacherService.getById(req.params.id);
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const teacher = await teacherService.update(req.params.id, req.validated);
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function getClasses(req, res, next) {
  try {
    const classes = await teacherService.getClasses(req.params.id);
    res.json(classes);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update, getClasses };
