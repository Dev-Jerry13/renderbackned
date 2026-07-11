const db = require('../../config/db');

async function findByTimetableAndDate(timetableId, date) {
  return db('proxy_assignments')
    .where({ timetable_id: timetableId, date })
    .first();
}

async function findById(id) {
  return db('proxy_assignments').where({ id }).first();
}

async function findPendingForTeacher(teacherId, date) {
  return db('proxy_assignments')
    .select(
      'proxy_assignments.*',
      'timetable.subject_id',
      'timetable.day',
      'timetable.start_time',
      'timetable.end_time',
      'timetable.room',
      'subjects.name as subject_name',
      'classes.name as class_name',
      'classes.section as class_section',
      'orig_teacher.full_name as original_teacher_name',
      'proxy_teacher.full_name as proxy_teacher_name',
      'requester.email as requested_by_email'
    )
    .join('timetable', 'proxy_assignments.timetable_id', 'timetable.id')
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('classes', 'timetable.class_id', 'classes.id')
    .join('teachers as orig_teacher', 'proxy_assignments.original_teacher_id', 'orig_teacher.id')
    .join('teachers as proxy_teacher', 'proxy_assignments.proxy_teacher_id', 'proxy_teacher.id')
    .join('users as requester', 'proxy_assignments.requested_by', 'requester.id')
    .where('proxy_assignments.proxy_teacher_id', teacherId)
    .where('proxy_assignments.date', date)
    .where('proxy_assignments.status', 'pending')
    .orderBy('timetable.start_time');
}

async function findForTeacherOnDate(teacherId, date) {
  return db('proxy_assignments')
    .select(
      'proxy_assignments.*',
      'timetable.subject_id',
      'timetable.day',
      'timetable.start_time',
      'timetable.end_time',
      'timetable.room',
      'subjects.name as subject_name',
      'classes.name as class_name',
      'classes.section as class_section',
      'orig_teacher.full_name as original_teacher_name',
      'proxy_teacher.full_name as proxy_teacher_name',
      'requester.email as requested_by_email'
    )
    .join('timetable', 'proxy_assignments.timetable_id', 'timetable.id')
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('classes', 'timetable.class_id', 'classes.id')
    .join('teachers as orig_teacher', 'proxy_assignments.original_teacher_id', 'orig_teacher.id')
    .join('teachers as proxy_teacher', 'proxy_assignments.proxy_teacher_id', 'proxy_teacher.id')
    .join('users as requester', 'proxy_assignments.requested_by', 'requester.id')
    .where(function () {
      this.where('proxy_assignments.original_teacher_id', teacherId)
        .orWhere('proxy_assignments.proxy_teacher_id', teacherId);
    })
    .where('proxy_assignments.date', date)
    .orderBy('timetable.start_time');
}

async function findForDate(schoolId, date) {
  return db('proxy_assignments')
    .select(
      'proxy_assignments.*',
      'timetable.subject_id',
      'timetable.day',
      'timetable.start_time',
      'timetable.end_time',
      'timetable.room',
      'subjects.name as subject_name',
      'classes.name as class_name',
      'classes.section as class_section',
      'orig_teacher.full_name as original_teacher_name',
      'proxy_teacher.full_name as proxy_teacher_name',
      'requester.email as requested_by_email'
    )
    .join('timetable', 'proxy_assignments.timetable_id', 'timetable.id')
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('classes', 'timetable.class_id', 'classes.id')
    .join('teachers as orig_teacher', 'proxy_assignments.original_teacher_id', 'orig_teacher.id')
    .join('teachers as proxy_teacher', 'proxy_assignments.proxy_teacher_id', 'proxy_teacher.id')
    .join('users as requester', 'proxy_assignments.requested_by', 'requester.id')
    .where('classes.school_id', schoolId)
    .where('proxy_assignments.date', date)
    .orderBy('timetable.start_time');
}

async function findAcceptedForClassOnDate(classId, date) {
  return db('proxy_assignments')
    .select(
      'proxy_assignments.timetable_id',
      'proxy_assignments.proxy_teacher_id',
      'proxy_assignments.original_teacher_id',
      'proxy_teacher.full_name as proxy_teacher_name',
      'orig_teacher.full_name as original_teacher_name'
    )
    .join('timetable', 'proxy_assignments.timetable_id', 'timetable.id')
    .join('teachers as proxy_teacher', 'proxy_assignments.proxy_teacher_id', 'proxy_teacher.id')
    .join('teachers as orig_teacher', 'proxy_assignments.original_teacher_id', 'orig_teacher.id')
    .where('timetable.class_id', classId)
    .where('proxy_assignments.date', date)
    .where('proxy_assignments.status', 'accepted');
}

async function findAvailableTeachers(schoolId, timetableId, date) {
  const entry = await db('timetable')
    .where({ id: timetableId })
    .first();
  if (!entry) return [];

  const busyTeacherIds = db('timetable')
    .select('teacher_id')
    .where('day', entry.day)
    .where('start_time', '<', entry.end_time)
    .where('end_time', '>', entry.start_time)
    .where('id', '!=', timetableId)
    .pluck('teacher_id');

  const busyProxyIds = db('proxy_assignments')
    .select('proxy_teacher_id as teacher_id')
    .join('timetable as t', 'proxy_assignments.timetable_id', 't.id')
    .where('proxy_assignments.date', date)
    .where('proxy_assignments.status', 'in', ['pending', 'accepted'])
    .where('t.day', entry.day)
    .where('t.start_time', '<', entry.end_time)
    .where('t.end_time', '>', entry.start_time)
    .pluck('proxy_teacher_id');

  return db('teachers')
    .select('teachers.id', 'teachers.full_name')
    .join('users', 'teachers.user_id', 'users.id')
    .where('users.school_id', schoolId)
    .where('users.role', 'teacher')
    .where('teachers.is_active', true)
    .where('teachers.id', '!=', entry.teacher_id)
    .whereNotIn('teachers.id', busyTeacherIds)
    .whereNotIn('teachers.id', busyProxyIds)
    .orderBy('teachers.full_name');
}

async function create(data) {
  const [record] = await db('proxy_assignments').insert(data).returning('*');
  return record;
}

async function updateStatus(id, status) {
  const [record] = await db('proxy_assignments')
    .where({ id })
    .update({ status, updated_at: db.fn.now() })
    .returning('*');
  return record;
}

async function remove(id) {
  await db('proxy_assignments').where({ id }).del();
}

module.exports = {
  findByTimetableAndDate,
  findById,
  findPendingForTeacher,
  findForTeacherOnDate,
  findForDate,
  findAcceptedForClassOnDate,
  findAvailableTeachers,
  create,
  updateStatus,
  remove,
};
