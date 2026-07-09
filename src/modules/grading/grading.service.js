const ApiError = require('../../utils/ApiError');
const repo = require('./grading.repository');

async function list(schoolId) {
  const systems = await repo.findAll(schoolId);
  const result = [];
  for (const system of systems) {
    const ranges = await repo.findRanges(system.id);
    result.push({ ...system, ranges });
  }
  return result;
}

async function getById(id, schoolId) {
  const system = await repo.findById(id, schoolId);
  if (!system) throw new ApiError(404, 'Grading system not found');
  const ranges = await repo.findRanges(id);
  return { ...system, ranges };
}

async function create(data, schoolId) {
  const { ranges, ...systemData } = data;
  const system = await repo.create({ ...systemData, school_id: schoolId });
  if (ranges && ranges.length > 0) {
    await repo.upsertRanges(system.id, ranges);
  }
  return getById(system.id, schoolId);
}

async function update(id, data, schoolId) {
  await getById(id, schoolId);
  const { ranges, ...systemData } = data;
  await repo.update(id, systemData, schoolId);
  if (ranges) {
    await repo.upsertRanges(id, ranges);
  }
  return getById(id, schoolId);
}

async function remove(id, schoolId) {
  await getById(id, schoolId);
  await repo.remove(id, schoolId);
  return { message: 'Grading system deleted' };
}

async function findGrade(schoolId, percentage) {
  const range = await repo.findApplicable(schoolId, percentage);
  return range || { grade: 'N/A', grade_point: null, description: 'No grade range defined' };
}

module.exports = { list, getById, create, update, remove, findGrade };
