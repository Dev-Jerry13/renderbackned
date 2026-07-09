const db = require('../../config/db');

async function findAll(schoolId) {
  return db('grading_systems')
    .select('*')
    .where('school_id', schoolId)
    .orderBy('name');
}

async function findById(id, schoolId) {
  return db('grading_systems').where({ id, school_id: schoolId }).first();
}

async function create(data) {
  const [system] = await db('grading_systems').insert(data).returning('*');
  return system;
}

async function update(id, data, schoolId) {
  const [system] = await db('grading_systems')
    .where({ id, school_id: schoolId })
    .update(data)
    .returning('*');
  return system;
}

async function remove(id, schoolId) {
  return db('grading_systems').where({ id, school_id: schoolId }).del();
}

async function findRanges(systemId) {
  return db('grading_ranges')
    .where('grading_system_id', systemId)
    .orderBy('min_percentage', 'asc');
}

async function upsertRanges(systemId, ranges) {
  await db('grading_ranges').where('grading_system_id', systemId).del();
  if (ranges.length > 0) {
    const records = ranges.map((r) => ({
      grading_system_id: systemId,
      grade: r.grade,
      min_percentage: r.min_percentage,
      max_percentage: r.max_percentage,
      grade_point: r.grade_point,
      description: r.description,
    }));
    return db('grading_ranges').insert(records).returning('*');
  }
  return [];
}

async function findApplicable(schoolId, percentage) {
  const systems = await db('grading_systems')
    .where({ school_id: schoolId, is_active: true })
    .orderBy('created_at', 'desc')
    .limit(1);

  if (systems.length === 0) return null;

  const range = await db('grading_ranges')
    .where('grading_system_id', systems[0].id)
    .where('min_percentage', '<=', percentage)
    .where('max_percentage', '>=', percentage)
    .first();

  return range || null;
}

module.exports = { findAll, findById, create, update, remove, findRanges, upsertRanges, findApplicable };
