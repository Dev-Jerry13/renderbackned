const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAll(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('subjects').where({ school_id: schoolId });
    if (mode === 'list') q = q.select('*').orderBy('name');
    return q;
  }, pagination);
}

async function findById(id, schoolId) {
  return db('subjects').where({ id, school_id: schoolId }).first();
}

async function create(data) {
  const [subject] = await db('subjects').insert(data).returning('*');
  return subject;
}

async function findAssignments(subjectId, schoolId) {
  return db('teacher_assignments')
    .select(
      'teacher_assignments.*',
      'teachers.full_name as teacher_name',
      'classes.name as class_name',
      'classes.section'
    )
    .join('teachers', 'teacher_assignments.teacher_id', 'teachers.id')
    .join('classes', 'teacher_assignments.class_id', 'classes.id')
    .where('teacher_assignments.subject_id', subjectId)
    .where('classes.school_id', schoolId);
}

async function findByClass(schoolId) {
  const rows = await db('teacher_assignments')
    .select(
      'classes.id as class_id',
      'classes.name as class_name',
      'classes.section',
      'subjects.id as subject_id',
      'subjects.name as subject_name'
    )
    .join('classes', 'teacher_assignments.class_id', 'classes.id')
    .join('subjects', 'teacher_assignments.subject_id', 'subjects.id')
    .where('classes.school_id', schoolId)
    .orderBy('classes.name')
    .orderBy('subjects.name');

  const map = {};
  for (const row of rows) {
    if (!map[row.class_id]) {
      map[row.class_id] = {
        class_id: row.class_id,
        class_name: row.class_name,
        section: row.section,
        subjects: [],
      };
    }
    map[row.class_id].subjects.push({
      id: row.subject_id,
      name: row.subject_name,
    });
  }
  return Object.values(map);
}

module.exports = { findAll, findById, create, findAssignments, findByClass };
