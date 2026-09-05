const announcementService = require('./announcements.service');

async function list(req, res) {
  const { classId, page, limit, search } = req.query;
  const result = await announcementService.list(req.user.schoolId, classId, { page, limit, search });
  res.json(result);
}

async function create(req, res) {
  const announcement = await announcementService.create({
    ...req.validated,
    school_id: req.user.schoolId,
    created_by: req.user.userId,
  }, req.user);
  res.status(201).json(announcement);
}

async function getById(req, res) {
  const announcement = await announcementService.getById(req.params.id, req.user.schoolId);
  res.json(announcement);
}

async function update(req, res) {
  const announcement = await announcementService.update(req.params.id, req.validated, req.user);
  res.json(announcement);
}

async function listByTeacher(req, res) {
  const { page, limit } = req.query;
  const result = await announcementService.listByTeacher(
    req.user.schoolId,
    req.params.teacherId,
    { page, limit }
  );
  res.json(result);
}

async function remove(req, res) {
  const result = await announcementService.remove(req.params.id, req.user);
  res.json(result);
}

module.exports = { list, create, getById, update, listByTeacher, remove };
