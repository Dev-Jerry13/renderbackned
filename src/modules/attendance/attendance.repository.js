const db = require('../../config/db');

async function findByClassAndDate(classId, date, schoolId) {
  return db('attendance')
    .select(
      'attendance.*',
      'students.full_name as student_name',
      'students.roll_number'
    )
    .join('students', 'attendance.student_id', 'students.id')
    .join('users', 'students.user_id', 'users.id')
    .where({ 'attendance.class_id': classId, 'attendance.date': date })
    .where('users.school_id', schoolId)
    .orderBy('students.roll_number');
}

async function findByStudent(studentId, month, schoolId) {
  let query = db('attendance')
    .select(
      'attendance.*',
      'students.full_name as student_name',
      'students.roll_number'
    )
    .join('students', 'attendance.student_id', 'students.id')
    .join('users', 'students.user_id', 'users.id')
    .where('attendance.student_id', studentId)
    .where('users.school_id', schoolId);

  if (month) {
    query = query.whereRaw("to_char(date, 'YYYY-MM') = ?", [month]);
  }

  return query.orderBy('attendance.date', 'desc');
}

async function bulkUpsert(records) {
  return db('attendance')
    .insert(records)
    .onConflict(['student_id', 'date'])
    .merge();
}

async function findById(id, schoolId) {
  return db('attendance')
    .join('students', 'attendance.student_id', 'students.id')
    .join('users', 'students.user_id', 'users.id')
    .where('attendance.id', id)
    .where('users.school_id', schoolId)
    .select('attendance.*')
    .first();
}

async function update(id, data) {
  const [record] = await db('attendance').where({ id }).update(data).returning('*');
  return record;
}

module.exports = { findByClassAndDate, findByStudent, bulkUpsert, findById, update };
