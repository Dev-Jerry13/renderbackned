const teacherService = require('./teachers.service');

async function list(req, res) {
  const { page, limit, search, is_active } = req.query;
  const filters = {};
  if (is_active !== undefined) filters.is_active = is_active === 'true';
  const result = await teacherService.list(req.user.schoolId, { page, limit, search, filters });
  res.json(result);
}

async function create(req, res) {
  const teacher = await teacherService.create({
    ...req.validated,
    school_id: req.user.schoolId,
  });
  res.status(201).json(teacher);
}

async function getById(req, res) {
  const teacher = await teacherService.getById(req.params.id, req.user.schoolId);
  res.json(teacher);
}

async function update(req, res) {
  const teacher = await teacherService.update(req.params.id, req.validated, req.user.schoolId);
  res.json(teacher);
}

async function getClasses(req, res) {
  const classes = await teacherService.getClasses(req.params.id, req.user.schoolId);
  res.json(classes);
}

async function getClassTeacherClass(req, res) {
  const cls = await teacherService.getClassTeacherClass(req.params.id, req.user.schoolId);
  if (!cls) return res.json(null);
  res.json(cls);
}

async function remove(req, res) {
  const result = await teacherService.remove(req.params.id, req.user.schoolId);
  res.json(result);
}

async function getTimetable(req, res) {
  const { date } = req.query;
  const timetable = await teacherService.getTimetable(req.params.id, req.user.schoolId, date);
  res.json(timetable);
}

async function setSubjects(req, res) {
  const result = await teacherService.setSubjects(
    req.params.id,
    req.validated.subject_ids,
    req.user.schoolId
  );
  res.json(result);
}

module.exports = { list, create, getById, update, remove, getClasses, getClassTeacherClass, getTimetable, setSubjects };
