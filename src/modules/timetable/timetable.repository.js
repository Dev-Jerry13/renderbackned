const db = require('../../config/db');

function _baseSelect(alias) {
  const prefix = alias ? `${alias}.` : 'timetable.';
  return [
    `${prefix}id`,
    `${prefix}class_id`,
    `${prefix}subject_id`,
    `${prefix}teacher_id`,
    `${prefix}day`,
    `${prefix}start_time`,
    `${prefix}end_time`,
    `${prefix}room`,
    'subjects.name as subject_name',
    'classes.name as class_name',
    'classes.section as class_section',
  ];
}

function _teacherNameCol(date) {
  if (date) {
    return db.raw(
      `COALESCE(pt.full_name, orig_t.full_name) as teacher_name`
    );
  }
  return 'teachers.full_name as teacher_name';
}

function _applyProxyJoin(query, date) {
  if (!date) {
    return query
      .join('teachers', 'timetable.teacher_id', 'teachers.id');
  }
  return query
    .join('teachers as orig_t', 'timetable.teacher_id', 'orig_t.id')
    .leftJoin('proxy_assignments as pa', function () {
      this.on('pa.timetable_id', 'timetable.id')
        .andOnVal('pa.date', date)
        .andOnVal('pa.status', 'accepted');
    })
    .leftJoin('teachers as pt', 'pa.proxy_teacher_id', 'pt.id');
}

async function findByClass(classId, schoolId, date) {
  let query = db('timetable')
    .select(
      ..._baseSelect(),
      _teacherNameCol(date),
      db.raw('pa.proxy_teacher_id as proxy_teacher_id'),
      db.raw('pa.original_teacher_id as original_teacher_id'),
      db.raw('CASE WHEN pa.id IS NOT NULL THEN true ELSE false END as has_proxy')
    )
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('classes', 'timetable.class_id', 'classes.id');

  query = _applyProxyJoin(query, date);

  return query
    .where('timetable.class_id', classId)
    .where('classes.school_id', schoolId)
    .orderBy('timetable.day')
    .orderBy('timetable.start_time');
}

async function findByTeacher(teacherId, schoolId, date) {
  let query = db('timetable')
    .select(
      ..._baseSelect(),
      _teacherNameCol(date),
      db.raw('pa.proxy_teacher_id as proxy_teacher_id'),
      db.raw('pa.original_teacher_id as original_teacher_id'),
      db.raw('CASE WHEN pa.id IS NOT NULL THEN true ELSE false END as has_proxy')
    )
    .join('subjects', 'timetable.subject_id', 'subjects.id')
    .join('classes', 'timetable.class_id', 'classes.id');

  query = _applyProxyJoin(query, date);

  return query
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
