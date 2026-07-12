const db = require('../../config/db');

async function studentStrengthReport(schoolId, query = {}) {
  const { class_id } = query;

  let q = db('classes')
    .select(
      'classes.id as class_id',
      'classes.name as class_name',
      'classes.section',
      db.raw('COUNT(students.id) AS total_students'),
      db.raw("COUNT(*) FILTER (WHERE students.is_active = true) AS active_students"),
      db.raw("COUNT(*) FILTER (WHERE students.is_active = false) AS inactive_students"),
    )
    .leftJoin('students', 'classes.id', 'students.class_id')
    .where('classes.school_id', schoolId)
    .groupBy('classes.id', 'classes.name', 'classes.section')
    .orderBy('classes.name')
    .orderBy('classes.section');

  if (class_id) {
    q = q.where('classes.id', class_id);
  }

  const rows = await q;

  return {
    generated_at: new Date().toISOString(),
    total_classes: rows.length,
    total_students: rows.reduce((s, r) => s + Number(r.total_students), 0),
    data: rows.map((r) => ({
      ...r,
      total_students: Number(r.total_students),
      active_students: Number(r.active_students),
      inactive_students: Number(r.inactive_students),
    })),
  };
}

async function attendanceReport(schoolId, query = {}) {
  const { class_id, start_date, end_date, group_by } = query;

  let q = db('attendance')
    .join('students', 'attendance.student_id', 'students.id')
    .join('classes', 'attendance.class_id', 'classes.id')
    .where('classes.school_id', schoolId);

  if (class_id) q = q.where('attendance.class_id', class_id);
  if (start_date) q = q.where('attendance.date', '>=', start_date);
  if (end_date) q = q.where('attendance.date', '<=', end_date);

  if (group_by === 'class') {
    q = q.select(
      'classes.id as class_id',
      'classes.name as class_name',
      'classes.section',
      db.raw('COUNT(attendance.id) AS total_records'),
      db.raw("COUNT(*) FILTER (WHERE attendance.status = 'present') AS present_count"),
      db.raw("COUNT(*) FILTER (WHERE attendance.status = 'absent') AS absent_count"),
      db.raw("COUNT(*) FILTER (WHERE attendance.status = 'late') AS late_count"),
    )
      .groupBy('classes.id', 'classes.name', 'classes.section')
      .orderBy('classes.name');

    const rows = await q;
    return {
      generated_at: new Date().toISOString(),
      group_by: 'class',
      data: rows.map((r) => ({
        ...r,
        total_records: Number(r.total_records),
        present_count: Number(r.present_count),
        absent_count: Number(r.absent_count),
        late_count: Number(r.late_count),
        attendance_percentage: Number(r.total_records) > 0
          ? Math.round((Number(r.present_count) / Number(r.total_records)) * 1000) / 10
          : 0,
      })),
    };
  }

  q = q.select(
    'students.id as student_id',
    'students.full_name as student_name',
    'students.roll_number',
    'classes.name as class_name',
    'classes.section',
    db.raw('COUNT(attendance.id) AS total_records'),
    db.raw("COUNT(*) FILTER (WHERE attendance.status = 'present') AS present_count"),
    db.raw("COUNT(*) FILTER (WHERE attendance.status = 'absent') AS absent_count"),
    db.raw("COUNT(*) FILTER (WHERE attendance.status = 'late') AS late_count"),
  )
    .groupBy('students.id', 'students.full_name', 'students.roll_number', 'classes.name', 'classes.section')
    .orderBy('students.full_name');

  const rows = await q;
  return {
    generated_at: new Date().toISOString(),
    group_by: 'student',
    data: rows.map((r) => ({
      ...r,
      total_records: Number(r.total_records),
      present_count: Number(r.present_count),
      absent_count: Number(r.absent_count),
      late_count: Number(r.late_count),
      attendance_percentage: Number(r.total_records) > 0
        ? Math.round((Number(r.present_count) / Number(r.total_records)) * 1000) / 10
        : 0,
    })),
  };
}

async function feeCollectionReport(schoolId, query = {}) {
  const { class_id, start_date, end_date } = query;

  let q = db('fee_payments')
    .join('students', 'fee_payments.student_id', 'students.id')
    .join('classes', 'students.class_id', 'classes.id')
    .join('fee_structures', 'fee_payments.fee_structure_id', 'fee_structures.id')
    .where('classes.school_id', schoolId);

  if (class_id) q = q.where('students.class_id', class_id);
  if (start_date) q = q.where('fee_payments.payment_date', '>=', start_date);
  if (end_date) q = q.where('fee_payments.payment_date', '<=', end_date);

  const rows = await q.select(
    'classes.id as class_id',
    'classes.name as class_name',
    'classes.section',
    'fee_structures.fee_type',
    db.raw('COUNT(fee_payments.id) AS payment_count'),
    db.raw('SUM(fee_payments.amount_paid) AS total_collected'),
  )
    .groupBy('classes.id', 'classes.name', 'classes.section', 'fee_structures.fee_type')
    .orderBy('classes.name')
    .orderBy('fee_structures.fee_type');

  const total = rows.reduce((s, r) => s + Number(r.total_collected), 0);

  return {
    generated_at: new Date().toISOString(),
    total_collected: Math.round(total * 100) / 100,
    data: rows.map((r) => ({
      ...r,
      payment_count: Number(r.payment_count),
      total_collected: Number(r.total_collected),
    })),
  };
}

async function teacherWorkloadReport(schoolId, query = {}) {
  const { class_id } = query;

  let q = db('teachers')
    .join('users', 'teachers.user_id', 'users.id')
    .where('users.school_id', schoolId)
    .where('teachers.is_active', true);

  const teachers = await q.select(
    'teachers.id as teacher_id',
    'teachers.full_name as teacher_name',
    'teachers.phone',
  ).orderBy('teachers.full_name');

  const result = [];

  for (const teacher of teachers) {
    let assignQ = db('teacher_assignments')
      .join('classes', 'teacher_assignments.class_id', 'classes.id')
      .join('subjects', 'teacher_assignments.subject_id', 'subjects.id')
      .where('teacher_assignments.teacher_id', teacher.teacher_id);

    if (class_id) assignQ = assignQ.where('classes.id', class_id);

    const assignments = await assignQ.select(
      'classes.name as class_name',
      'classes.section',
      'subjects.name as subject_name',
    ).orderBy('classes.name');

    result.push({
      ...teacher,
      total_classes: new Set(assignments.map((a) => `${a.class_name}-${a.section}`)).size,
      total_subjects: new Set(assignments.map((a) => a.subject_name)).size,
      assignments,
    });
  }

  return {
    generated_at: new Date().toISOString(),
    total_teachers: result.length,
    data: result,
  };
}

async function admissionsReport(schoolId, query = {}) {
  const { class_id, start_date, end_date } = query;

  const dateFilter = db.raw('DATE(students.created_at)');

  let q = db('students')
    .join('users', 'students.user_id', 'users.id')
    .join('classes', 'students.class_id', 'classes.id')
    .where('users.school_id', schoolId);

  if (class_id) q = q.where('students.class_id', class_id);
  if (start_date) q = q.where('students.created_at', '>=', start_date);
  if (end_date) q = q.where('students.created_at', '<=', end_date + 'T23:59:59.999Z');

  const rows = await q.select(
    dateFilter,
    db.raw('COUNT(students.id) AS count'),
  )
    .groupBy(dateFilter)
    .orderBy('date');

  return {
    generated_at: new Date().toISOString(),
    total_admissions: rows.reduce((s, r) => s + Number(r.count), 0),
    data: rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
  };
}

module.exports = {
  studentStrengthReport,
  attendanceReport,
  feeCollectionReport,
  teacherWorkloadReport,
  admissionsReport,
};
