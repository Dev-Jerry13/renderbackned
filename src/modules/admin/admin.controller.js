const db = require('../../config/db');
const ApiError = require('../../utils/ApiError');

async function dashboardStats(req, res) {
  const schoolId = req.user.schoolId;

  const [studentCount] = await db('students')
    .join('users', 'students.user_id', 'users.id')
    .where({ 'users.school_id': schoolId, 'students.is_active': true })
    .count('students.id as count');

  const [teacherCount] = await db('teachers')
    .join('users', 'teachers.user_id', 'users.id')
    .where({ 'users.school_id': schoolId, 'teachers.is_active': true })
    .count('teachers.id as count');

  const [classCount] = await db('classes')
    .where({ school_id: schoolId })
    .count('id as count');

  const today = new Date().toISOString().slice(0, 10);

  const attendanceResult = await db('attendance')
    .join('students', 'attendance.student_id', 'students.id')
    .join('classes', 'attendance.class_id', 'classes.id')
    .where({ 'classes.school_id': schoolId, 'attendance.date': today })
    .select([
      db.raw('COUNT(attendance.id) AS total'),
      db.raw("SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_count"),
    ])
    .first();

  const totalAttendance = Number(attendanceResult?.total ?? 0);
  const presentCount = Number(attendanceResult?.present_count ?? 0);
  const todayAttendancePercentage = totalAttendance > 0
    ? (presentCount / totalAttendance) * 100
    : 0;

  res.json({
    totalStudents: Number(studentCount?.count ?? 0),
    totalTeachers: Number(teacherCount?.count ?? 0),
    totalClasses: Number(classCount?.count ?? 0),
    todayAttendancePercentage: Math.round(todayAttendancePercentage * 10) / 10,
  });
}

async function getSchoolProfile(req, res) {
  const school = await db('schools').where({ id: req.user.schoolId }).first();
  if (!school) throw new ApiError(404, 'School not found');
  res.json(school);
}

async function updateSchoolProfile(req, res) {
  const allowed = ['name', 'address', 'phone', 'email', 'website', 'logo_url', 'academic_year', 'established_year'];
  const updates = {};
  for (const key of allowed) {
    if (req.validated[key] !== undefined) updates[key] = req.validated[key];
  }
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No valid fields to update');
  }
  updates.updated_at = db.fn.now();
  const [school] = await db('schools').where({ id: req.user.schoolId }).update(updates).returning('*');
  res.json(school);
}

async function dashboardOverview(req, res) {
  const schoolId = req.user.schoolId;
  const today = new Date().toISOString().slice(0, 10);

  // ── Core stats (parallel) ──
  const [
    [studentCount],
    [teacherCount],
    attendanceResult,
    feeTotals,
    outstandingTotals,
  ] = await Promise.all([
    db('students')
      .join('users', 'students.user_id', 'users.id')
      .where({ 'users.school_id': schoolId, 'students.is_active': true })
      .count('students.id as count'),
    db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .where({ 'users.school_id': schoolId, 'teachers.is_active': true })
      .count('teachers.id as count'),
    db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('classes', 'attendance.class_id', 'classes.id')
      .where({ 'classes.school_id': schoolId, 'attendance.date': today })
      .select([
        db.raw('COUNT(attendance.id) AS total'),
        db.raw("SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_count"),
      ])
      .first(),
    db('fee_payments')
      .join('students', 'fee_payments.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .select([
        db.raw('COALESCE(SUM(fee_payments.amount_paid), 0) AS total_collected'),
      ])
      .first(),
    db('fee_structures')
      .join('classes', 'fee_structures.class_id', 'classes.id')
      .where('classes.school_id', schoolId)
      .select([
        db.raw('COALESCE(SUM(fee_structures.amount), 0) AS total_expected'),
      ])
      .first(),
  ]);

  const totalAttendance = Number(attendanceResult?.total ?? 0);
  const presentCount = Number(attendanceResult?.present_count ?? 0);
  const todayAttendancePercentage = totalAttendance > 0
    ? Math.round((presentCount / totalAttendance) * 1000) / 10
    : 0;

  const totalCollected = Number(feeTotals?.total_collected ?? 0);
  const totalExpected = Number(outstandingTotals?.total_expected ?? 0);
  const feeCollectionRate = totalExpected > 0
    ? Math.round((totalCollected / totalExpected) * 1000) / 10
    : 0;
  const totalOutstanding = Math.max(0, totalExpected - totalCollected);

  // ── Weekly attendance (last 7 days) ──
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const weekStart = sevenDaysAgo.toISOString().slice(0, 10);

  const [weeklyRows, lowAttRows] = await Promise.all([
    db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('classes', 'attendance.class_id', 'classes.id')
      .where('classes.school_id', schoolId)
      .whereBetween('attendance.date', [weekStart, today])
      .select(
        'attendance.date',
        db.raw('COUNT(attendance.id) AS total'),
        db.raw("SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_count"),
      )
      .groupBy('attendance.date')
      .orderBy('attendance.date'),
    db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('classes', 'attendance.class_id', 'classes.id')
      .where({ 'classes.school_id': schoolId, 'attendance.date': today })
      .select(
        'classes.id as class_id',
        'classes.name as class_name',
        'classes.section',
        db.raw('COUNT(attendance.id) AS total'),
        db.raw("SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) AS present_count"),
      )
      .groupBy('classes.id', 'classes.name', 'classes.section')
      .having(
        db.raw("CASE WHEN COUNT(attendance.id) > 0 THEN SUM(CASE WHEN attendance.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(attendance.id) ELSE 100 END < 75")
      ),
  ]);

  const weeklyMap = {};
  weeklyRows.forEach((r) => {
    const t = Number(r.total);
    const p = Number(r.present_count);
    weeklyMap[r.date] = t > 0 ? Math.round((p / t) * 1000) / 10 : 0;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyAttendance = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    weeklyAttendance.push({
      day: dayNames[d.getDay()],
      date: dateStr,
      percentage: weeklyMap[dateStr] ?? 0,
    });
  }

  const lowAttendanceClasses = lowAttRows.map((r) => {
    const t = Number(r.total);
    const p = Number(r.present_count);
    return {
      classId: r.class_id,
      className: r.class_name,
      section: r.section,
      percentage: t > 0 ? Math.round((p / t) * 1000) / 10 : 0,
    };
  });

  // ── Parallel: proxies, events ──
  const twoWeeksLater = new Date();
  twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
  const holidayEnd = twoWeeksLater.toISOString().slice(0, 10);

  const [
    [proxyCount],
    upcomingHolidays,
    upcomingExams,
    recentAnnouncements,
  ] = await Promise.all([
    db('proxy_assignments')
      .join('timetable as t', 'proxy_assignments.timetable_id', 't.id')
      .join('classes', 't.class_id', 'classes.id')
      .where('classes.school_id', schoolId)
      .where('proxy_assignments.status', 'pending')
      .count('proxy_assignments.id as count'),
    db('holidays')
      .where('school_id', schoolId)
      .whereBetween('date', [today, holidayEnd])
      .orderBy('date')
      .limit(3)
      .select('id', 'title', 'date', 'type'),
    db('exams')
      .where('school_id', schoolId)
      .where('is_published', true)
      .whereBetween('exam_date', [today, holidayEnd])
      .orderBy('exam_date')
      .limit(3)
      .select('id', 'name', 'exam_date'),
    db('announcements')
      .where('school_id', schoolId)
      .orderBy('created_at', 'desc')
      .limit(3)
      .select('id', 'title', 'created_at'),
  ]);

  // Merge holidays + exams into sorted upcoming events
  const allEvents = [
    ...upcomingHolidays.map((h) => ({ ...h, _type: 'holiday' })),
    ...upcomingExams.map((e) => ({ ...e, _type: 'exam' })),
  ].sort((a, b) => {
    const da = a.date || a.exam_date || '';
    const db_ = b.date || b.exam_date || '';
    return da.localeCompare(db_);
  });

  // ── Pending alerts count (distinct categories with items) ──
  const pendingAlerts = (lowAttendanceClasses.length > 0 ? 1 : 0)
    + (Number(proxyCount?.count ?? 0) > 0 ? 1 : 0)
    + (totalOutstanding > 0 ? 1 : 0);

  res.json({
    stats: {
      totalStudents: Number(studentCount?.count ?? 0),
      totalTeachers: Number(teacherCount?.count ?? 0),
      todayAttendancePercentage,
      feeCollectionRate,
      totalCollected,
      totalOutstanding,
      pendingAlerts,
    },
    weeklyAttendance,
    feeCollectionTrend: [], // TODO: add when fee trend is needed
    lowAttendanceClasses,
    pendingProxies: Number(proxyCount?.count ?? 0),
    upcomingHolidays,
    upcomingExams,
    recentAnnouncements,
  });
}

module.exports = { dashboardStats, dashboardOverview, getSchoolProfile, updateSchoolProfile };
