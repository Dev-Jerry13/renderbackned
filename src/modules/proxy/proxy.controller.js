const proxyService = require('./proxy.service');

async function assign(req, res, next) {
  try {
    const { timetable_id, proxy_teacher_id, reason, date } = req.validated;
    const result = await proxyService.assignProxy(
      timetable_id,
      proxy_teacher_id,
      req.user.userId,
      req.user.role,
      req.user.schoolId,
      reason,
      date
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function respond(req, res, next) {
  try {
    const { status } = req.validated;
    const result = await proxyService.respondToProxy(
      req.params.id,
      req.user.userId,
      status
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const result = await proxyService.cancelProxy(
      req.params.id,
      req.user.userId,
      req.user.role
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function myProxies(req, res, next) {
  try {
    const { date } = req.query;
    const result = await proxyService.getMyProxies(req.user.teacherId, date);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function pendingRequests(req, res, next) {
  try {
    const result = await proxyService.getPendingRequests(req.user.teacherId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function todayForClass(req, res, next) {
  try {
    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ error: 'classId query parameter is required' });
    }
    const result = await proxyService.getTodayProxiesForClass(classId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function available(req, res, next) {
  try {
    const { timetableId, date } = req.query;
    if (!timetableId) {
      return res.status(400).json({ error: 'timetableId query parameter is required' });
    }
    const result = await proxyService.getAvailableTeachers(req.user.schoolId, timetableId, date);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function adminList(req, res, next) {
  try {
    const { date } = req.query;
    const result = await proxyService.getAdminProxies(req.user.schoolId, date);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  assign,
  respond,
  cancel,
  myProxies,
  pendingRequests,
  todayForClass,
  available,
  adminList,
};
