const staffService = require('./staff.service');

async function list(req, res) {
  const { page, limit, department, is_active } = req.query;
  const filters = {};
  if (department) filters.department = department;
  if (is_active !== undefined) filters.is_active = is_active === 'true';
  const result = await staffService.list(req.user.schoolId, { page, limit }, filters);
  res.json(result);
}

async function create(req, res) {
  const staff = await staffService.create({
    ...req.validated,
    school_id: req.user.schoolId,
  });
  res.status(201).json(staff);
}

async function getById(req, res) {
  const staff = await staffService.getById(req.params.id, req.user.schoolId);
  res.json(staff);
}

async function update(req, res) {
  const staff = await staffService.update(req.params.id, req.validated, req.user.schoolId);
  res.json(staff);
}

async function remove(req, res) {
  const result = await staffService.remove(req.params.id, req.user.schoolId);
  res.json(result);
}

async function getDepartments(req, res) {
  const departments = await staffService.getDepartments(req.user.schoolId);
  res.json(departments.map((d) => d.department));
}

module.exports = { list, create, getById, update, remove, getDepartments };
