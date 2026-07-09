const db = require('../../config/db');

async function findByClass(classId, schoolId) {
  return db('timetable')
    .select(
      'timetable.*',
      'subjects.name as subject_name',
      'teachers.full_name as teacher_name',
      'classes.name as class_name',
      'classes.section as class_section'
    )
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('teachers', 'timetable.teacher_id', 'teachers.id')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.class_id', classId)
    .where('classes.school_id', schoolId)
    .orderBy('timetable.day')
    .orderBy('timetable.start_time');
}

async function findByTeacher(teacherId, schoolId) {
  return db('timetable')
    .select(
      'timetable.*',
      'subjects.name as subject_name',
      'teachers.full_name as teacher_name',
      'classes.name as class_name',
      'classes.section as class_section'
    )
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('teachers', 'timetable.teacher_id', 'teachers.id')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.teacher_id', teacherId)
    .where('classes.school_id', schoolId)
    .orderBy('timetable.day')
    .orderBy('timetable.start_time');
}

async function findById(id, schoolId) {
  return db('timetable')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.id', id)
    .where('classes.school_id', schoolId)
    .select('timetable.*')
    .first();
}

async function findConflicts(data, excludeId) {
  let query = db('timetable')
    .where('day', data.day)
    .where(function () {
      this.where(function () {
        this.where('start_time', '<', data.end_time)
            .where('end_time', '>', data.start_time);
      });
    });

  if (data.teacher_id) {
    query = query.andWhere('teacher_id', data.teacher_id);
  }

  if (data.class_id) {
    query = query.andWhere('class_id', data.class_id);
  }

  if (excludeId) {
    query = query.andWhere('id', '!=', excludeId);
  }

  return query;
}

async function create(data) {
  const [entry] = await db('timetable').insert(data).returning('*');
  return entry;
}

async function update(id, data, schoolId) {
  const [entry] = await db('timetable')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.id', id)
    .where('classes.school_id', schoolId)
    .select('timetable.*')
    .first();
  if (!entry) return null;
  const [updated] = await db('timetable').where({ id }).update(data).returning('*');
  return updated;
}

async function remove(id, schoolId) {
  const entry = await db('timetable')
    .join('classes', 'timetable.class_id', 'classes.id')
    .where('timetable.id', id)
    .where('classes.school_id', schoolId)
    .select('timetable.id')
    .first();
  if (!entry) return;
  await db('timetable').where({ id }).del();
}

module.exports = { findByClass, findByTeacher, findById, findConflicts, create, update, remove };
