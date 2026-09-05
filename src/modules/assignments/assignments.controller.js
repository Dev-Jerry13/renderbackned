const assignmentService = require('./assignments.service');

async function list(req, res) {
  const { classId, subjectId, page, limit } = req.query;
  const filters = { classId, subjectId };
  if (req.user.role === 'teacher' && req.user.teacherId) {
    filters.teacherId = req.user.teacherId;
  }
  if (req.user.role === 'student' && req.user.studentId) {
    filters.studentId = req.user.studentId;
  }
  const result = await assignmentService.list(filters, { page, limit }, req.user.schoolId);
  res.json(result);
}

async function create(req, res) {
  const teacherId = req.user.teacherId || req.validated.teacher_id;
  if (!teacherId) {
    return res.status(400).json({ error: 'Teacher ID is required. Admin must provide teacher_id in request body.' });
  }
  const assignment = await assignmentService.create({
    ...req.validated,
    teacher_id: teacherId,
  });
  res.status(201).json(assignment);
}

async function update(req, res) {
  const assignment = await assignmentService.update(req.params.id, req.validated, req.user.schoolId);
  res.json(assignment);
}

async function remove(req, res) {
  const result = await assignmentService.remove(req.params.id, req.user.schoolId);
  res.json(result);
}

module.exports = { list, create, update, remove };
