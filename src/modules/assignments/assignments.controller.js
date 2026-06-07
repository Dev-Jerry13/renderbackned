const assignmentService = require('./assignments.service');

async function list(req, res, next) {
  try {
    const { classId, subjectId } = req.query;
    const assignments = await assignmentService.list({ classId, subjectId });
    res.json(assignments);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const assignment = await assignmentService.create({
      ...req.validated,
      teacher_id: req.user.teacherId,
    });
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const assignment = await assignmentService.update(req.params.id, req.validated);
    res.json(assignment);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await assignmentService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
