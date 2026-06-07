const subjectService = require('./subjects.service');

async function list(req, res, next) {
  try {
    const subjects = await subjectService.list();
    res.json(subjects);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const subject = await subjectService.create({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(subject);
  } catch (err) {
    next(err);
  }
}

async function assign(req, res, next) {
  try {
    const result = await subjectService.assign(
      req.params.id,
      req.validated.teacher_id,
      req.validated.class_id
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, assign };
