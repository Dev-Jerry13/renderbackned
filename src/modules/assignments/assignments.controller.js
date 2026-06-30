const assignmentService = require('./assignments.service');

async function list(req, res, next) {
  try {
    const { classId, subjectId, page, limit } = req.query;
    const filters = { classId, subjectId };
    if (req.user.role === 'teacher' && req.user.teacherId) {
      filters.teacherId = req.user.teacherId;
    }
    if (req.user.role === 'student' && req.user.studentId) {
      filters.studentId = req.user.studentId;
    }
    const result = await assignmentService.list(filters, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const teacherId = req.user.teacherId || req.validated.teacher_id;
    if (!teacherId) {
      return res.status(400).json({ error: 'Teacher ID is required. Admin must provide teacher_id in request body.' });
    }
    const assignment = await assignmentService.create({
      ...req.validated,
      teacher_id: teacherId,
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
