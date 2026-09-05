const proxyService = require('./proxy.service');
const { z } = require('zod');
const ApiError = require('../../utils/ApiError');

async function assign(req, res) {
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
}

async function respond(req, res) {
  const { status } = req.validated;
  const result = await proxyService.respondToProxy(
    req.params.id,
    req.user.userId,
    status
  );
  res.json(result);
}

async function cancel(req, res) {
  const parsedId = z.string().uuid().safeParse(req.params.id);
  if (!parsedId.success) throw new ApiError(400, 'Invalid proxy ID');
  const result = await proxyService.cancelProxy(
    parsedId.data,
    req.user.userId,
    req.user.role
  );
  res.json(result);
}

async function myProxies(req, res) {
  const { date } = req.query;
  const result = await proxyService.getMyProxies(req.user.teacherId, date);
  res.json(result);
}

async function pendingRequests(req, res) {
  const result = await proxyService.getPendingRequests(req.user.teacherId);
  res.json(result);
}

async function todayForClass(req, res) {
  const { classId } = req.query;
  if (!classId) {
    return res.status(400).json({ error: 'classId query parameter is required' });
  }
  const result = await proxyService.getTodayProxiesForClass(classId);
  res.json(result);
}

async function available(req, res) {
  const { timetableId, date } = req.query;
  if (!timetableId) {
    return res.status(400).json({ error: 'timetableId query parameter is required' });
  }
  const result = await proxyService.getAvailableTeachers(req.user.schoolId, timetableId, date);
  res.json(result);
}

async function teachers(req, res) {
  const { timetableId, date } = req.query;
  if (!timetableId) {
    return res.status(400).json({ error: 'timetableId query parameter is required' });
  }
  const result = await proxyService.getTeachersForProxy(req.user.schoolId, timetableId, date);
  res.json(result);
}

async function adminList(req, res) {
  const { date } = req.query;
  const result = await proxyService.getAdminProxies(req.user.schoolId, date);
  res.json(result);
}

module.exports = {
  assign,
  respond,
  cancel,
  myProxies,
  pendingRequests,
  todayForClass,
  available,
  teachers,
  adminList,
};
