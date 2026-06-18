const db = require('../../config/db');

async function dashboardStats(req, res, next) {
  try {
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
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboardStats };
