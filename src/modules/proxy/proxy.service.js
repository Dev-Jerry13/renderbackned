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

function _addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function _dayOfWeekStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][weekday];
}

function _resolveTargetDate(date) {
  const today = _todayStr();
  const tomorrow = _addDays(today, 1);
  const targetDate = date || today;
  if (targetDate !== today && targetDate !== tomorrow) {
    throw new ApiError(
      400,
      'Proxy can only be assigned for today or tomorrow'
    );
  }
  return targetDate;
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

async function assignProxy(timetableId, proxyTeacherId, requestedBy, userRole, schoolId, reason, date) {
  const isAdmin = userRole === 'admin';
  const targetDate = isAdmin ? (date || _todayStr()) : _resolveTargetDate(date);

  const entry = await _getTimetableEntry(timetableId);
  if (!entry) throw new ApiError(404, 'Timetable entry not found');

  if (schoolId && entry.school_id !== schoolId) {
    throw new ApiError(404, 'Timetable entry not found');
  }

  if (entry.day !== _dayOfWeekStr(targetDate)) {
    throw new ApiError(
      400,
      `Timetable entry is scheduled for ${entry.day}, not on ${targetDate}`
    );
  }

  if (entry.teacher_id === proxyTeacherId) {
    throw new ApiError(400, 'Cannot assign proxy to yourself');
  }

  if (!isAdmin && entry.teacher_user_id !== requestedBy) {
    throw new ApiError(403, 'You can only assign proxy for your own lectures');
  }

  const existing = await repo.findByTimetableAndDate(timetableId, targetDate);
  if (existing && (existing.status === 'pending' || existing.status === 'accepted')) {
    throw new ApiError(409, 'A proxy is already assigned for this lecture on the selected date');
  }

  const proxyTeacher = await db('teachers')
    .join('users', 'teachers.user_id', 'users.id')
    .where('teachers.id', proxyTeacherId)
    .where('teachers.is_active', true)
    .where('users.school_id', schoolId)
    .first();
  if (!proxyTeacher) throw new ApiError(404, 'Proxy teacher not found or inactive');

  if (!isAdmin) {
    const available = await repo.findAvailableTeachers(entry.school_id, timetableId, targetDate);
    if (!available.some((t) => t.id === proxyTeacherId)) {
      throw new ApiError(409, 'Selected teacher is not available at this time slot');
    }
  }

  const record = await repo.create({
    timetable_id: timetableId,
    date: targetDate,
    original_teacher_id: entry.teacher_id,
    proxy_teacher_id: proxyTeacherId,
    requested_by: requestedBy,
    status: isAdmin ? 'accepted' : 'pending',
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

async function getAvailableTeachers(schoolId, timetableId, date) {
  const targetDate = date || _todayStr();
  return repo.findAvailableTeachers(schoolId, timetableId, targetDate);
}

async function getTeachersForProxy(schoolId, timetableId, date) {
  const targetDate = date || _todayStr();
  return repo.findTeachersWithStatus(schoolId, timetableId, targetDate);
}

async function getAdminProxies(schoolId, date) {
  return repo.findForDate(schoolId, date || _todayStr());
}

module.exports = {
  assignProxy,
  respondToProxy,
  cancelProxy,
  getMyProxies,
  getPendingRequests,
  getTodayProxiesForClass,
  getAvailableTeachers,
  getTeachersForProxy,
  getAdminProxies,
};
