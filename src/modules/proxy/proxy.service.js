const ApiError = require('../../utils/ApiError');
const repo = require('./proxy.repository');
const db = require('../../config/db');

function _todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function _getTimetableEntry(timetableId) {
  return db('timetable')
    .select(
      'timetable.*',
      'classes.school_id',
      'teachers.full_name as teacher_name',
      'teachers.user_id as teacher_user_id'
    )
    .join('classes', 'timetable.class_id', 'classes.id')
    .join('teachers', 'timetable.teacher_id', 'teachers.id')
    .where('timetable.id', timetableId)
    .first();
}

async function assignProxy(timetableId, proxyTeacherId, requestedBy, userRole, schoolId, reason) {
  const today = _todayStr();

  const entry = await _getTimetableEntry(timetableId);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');

  if (schoolId && entry.school_id !== schoolId) {
    throw new ApiError(404, 'Timetable entry not found');
  }

  if (entry.teacher_id === proxyTeacherId) {
    throw new ApiError(400, 'Cannot assign proxy to yourself');
  }

  if (userRole !== 'admin' && entry.teacher_user_id !== requestedBy) {
    throw new ApiError(403, 'You can only assign proxy for your own lectures');
  }

  const existing = await repo.findByTimetableAndDate(timetableId, today);
  if (existing && (existing.status === 'pending' || existing.status === 'accepted')) {
    throw new ApiError(409, 'A proxy is already assigned for this lecture today');
  }

  const proxyTeacher = await db('teachers')
    .where({ id: proxyTeacherId, is_active: true })
    .first();
  if (!proxyTeacher) throw new ApiError(404, 'Proxy teacher not found or inactive');

  const available = await repo.findAvailableTeachers(entry.school_id, timetableId, today);
  if (!available.some((t) => t.id === proxyTeacherId)) {
    throw new ApiError(409, 'Selected teacher is not available at this time slot');
  }

  const autoApprove = userRole === 'admin';
  const record = await repo.create({
    timetable_id: timetableId,
    date: today,
    original_teacher_id: entry.teacher_id,
    proxy_teacher_id: proxyTeacherId,
    requested_by: requestedBy,
    status: autoApprove ? 'accepted' : 'pending',
    reason: reason || null,
  });

  return {
    ...record,
    subject_id: entry.subject_id,
    day: entry.day,
    start_time: entry.start_time,
    end_time: entry.end_time,
    room: entry.room,
    teacher_name: entry.teacher_name,
  };
}

async function respondToProxy(proxyId, userId, status) {
  const record = await repo.findById(proxyId);
  if (!record) throw new ApiError(404, 'Proxy assignment not found');

  const teacher = await db('teachers')
    .where({ id: record.proxy_teacher_id, user_id: userId })
    .first();
  if (!teacher) {
    throw new ApiError(403, 'Only the assigned proxy teacher can respond');
  }

  if (record.status !== 'pending') {
    throw new ApiError(400, `Cannot respond to a proxy with status: ${record.status}`);
  }

  return repo.updateStatus(proxyId, status);
}

async function cancelProxy(proxyId, userId, userRole) {
  const record = await repo.findById(proxyId);
  if (!record) throw new ApiError(404, 'Proxy assignment not found');

  if (userRole !== 'admin') {
    const teacher = await db('teachers')
      .where({ id: record.original_teacher_id, user_id: userId })
      .first();
    if (!teacher) {
      throw new ApiError(403, 'Only the original teacher or an admin can cancel');
    }
  }

  if (record.status === 'cancelled') {
    throw new ApiError(400, 'Proxy is already cancelled');
  }

  return repo.updateStatus(proxyId, 'cancelled');
}

async function getMyProxies(teacherId, date) {
  const targetDate = date || _todayStr();
  return repo.findForTeacherOnDate(teacherId, targetDate);
}

async function getPendingRequests(teacherId) {
  return repo.findPendingForTeacher(teacherId, _todayStr());
}

async function getTodayProxiesForClass(classId) {
  return repo.findAcceptedForClassOnDate(classId, _todayStr());
}

async function getAvailableTeachers(schoolId, timetableId) {
  return repo.findAvailableTeachers(schoolId, timetableId, _todayStr());
}

async function getAdminProxies(date) {
  return repo.findForDate(null, date || _todayStr());
}

module.exports = {
  assignProxy,
  respondToProxy,
  cancelProxy,
  getMyProxies,
  getPendingRequests,
  getTodayProxiesForClass,
  getAvailableTeachers,
  getAdminProxies,
};
