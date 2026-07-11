const teacherService = require('./teachers.service');

async function list(req, res, next) {
  try {
    const { page, limit, search, is_active } = req.query;
    const filters = {};
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    const result = await teacherService.list(req.user.schoolId, { page, limit, search, filters });
    res.json(result);
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
    const teacher = await teacherService.getById(req.params.id, req.user.schoolId);
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const teacher = await teacherService.update(req.params.id, req.validated, req.user.schoolId);
    res.json(teacher);
  } catch (err) {
    next(err);
  }
}

async function getClasses(req, res, next) {
  try {
    const classes = await teacherService.getClasses(req.params.id, req.user.schoolId);
    res.json(classes);
  } catch (err) {
    next(err);
  }
}

async function getClassTeacherClass(req, res, next) {
  try {
    const cls = await teacherService.getClassTeacherClass(req.params.id, req.user.schoolId);
    if (!cls) return res.json(null);
    res.json(cls);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await teacherService.remove(req.params.id, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getTimetable(req, res, next) {
  try {
    const { date } = req.query;
    const timetable = await teacherService.getTimetable(req.params.id, req.user.schoolId, date);
    res.json(timetable);
  } catch (err) {
    next(err);
  }
}

async function setSubjects(req, res, next) {
  try {
    const result = await teacherService.setSubjects(
      req.params.id,
      req.validated.subject_ids,
      req.user.schoolId
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update, remove, getClasses, getClassTeacherClass, getTimetable, setSubjects };
