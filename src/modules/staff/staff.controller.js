const staffService = require('./staff.service');

async function list(req, res, next) {
  try {
    const { page, limit, department, is_active } = req.query;
    const filters = {};
    if (department) filters.department = department;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    const result = await staffService.list(req.user.schoolId, { page, limit }, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const staff = await staffService.create({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(staff);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const staff = await staffService.getById(req.params.id, req.user.schoolId);
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const staff = await staffService.update(req.params.id, req.validated, req.user.schoolId);
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await staffService.remove(req.params.id, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getDepartments(req, res, next) {
  try {
    const departments = await staffService.getDepartments(req.user.schoolId);
    res.json(departments.map((d) => d.department));
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update, remove, getDepartments };
