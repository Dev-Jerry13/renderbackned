const announcementService = require('./announcements.service');

async function list(req, res, next) {
  try {
    const { classId, page, limit } = req.query;
    const result = await announcementService.list(req.user.schoolId, classId, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const announcement = await announcementService.create({
      ...req.validated,
      school_id: req.user.schoolId,
      created_by: req.user.userId,
    });
    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const announcement = await announcementService.update(req.params.id, req.validated);
    res.json(announcement);
  } catch (err) {
    next(err);
  }
}

async function listByTeacher(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await announcementService.listByTeacher(
      req.user.schoolId,
      req.params.teacherId,
      { page, limit }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await announcementService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, listByTeacher, remove };
