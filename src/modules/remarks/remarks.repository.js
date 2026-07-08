const db = require('../../config/db');

async function create(data) {
  const [remark] = await db('student_remarks').insert(data).returning('*');
  return remark;
}

async function findById(id, schoolId) {
  return db('student_remarks')
    .where({ id, school_id: schoolId })
    .first();
}

async function findByStudent(studentId, schoolId) {
  return db('student_remarks')
    .join('teachers', 'student_remarks.teacher_id', 'teachers.id')
    .join('users', 'teachers.user_id', 'users.id')
    .where('student_remarks.student_id', studentId)
    .where('student_remarks.school_id', schoolId)
    .select(
      'student_remarks.*',
      'teachers.full_name as teacher_name'
    )
    .orderBy('student_remarks.created_at', 'desc');
}

async function findByTeacher(teacherId, schoolId) {
  return db('student_remarks')
    .join('students', 'student_remarks.student_id', 'students.id')
    .join('users', 'students.user_id', 'users.id')
    .where('student_remarks.teacher_id', teacherId)
    .where('student_remarks.school_id', schoolId)
    .select(
      'student_remarks.*',
      'students.full_name as student_name'
    )
    .orderBy('student_remarks.created_at', 'desc');
}

async function findByStudentAndTeacher(studentId, teacherId, schoolId) {
  return db('student_remarks')
    .join('students', 'student_remarks.student_id', 'students.id')
    .join('users', 'students.user_id', 'users.id')
    .where('student_remarks.student_id', studentId)
    .where('student_remarks.teacher_id', teacherId)
    .where('student_remarks.school_id', schoolId)
    .select(
      'student_remarks.*',
      'students.full_name as student_name'
    )
    .orderBy('student_remarks.created_at', 'desc');
}

async function markAsRead(id, studentId) {
  const [remark] = await db('student_remarks')
    .where({ id, student_id: studentId })
    .update({ is_read: true, updated_at: db.fn.now() })
    .returning('*');
  return remark;
}

async function update(id, schoolId, data) {
  const [remark] = await db('student_remarks')
    .where({ id, school_id: schoolId })
    .update({ ...data, updated_at: db.fn.now() })
    .returning('*');
  return remark;
}

async function deleteRemark(id, schoolId) {
  const [remark] = await db('student_remarks')
    .where({ id, school_id: schoolId })
    .delete()
    .returning('*');
  return remark;
}

module.exports = { create, findById, findByStudent, findByTeacher, findByStudentAndTeacher, markAsRead, update, deleteRemark };
