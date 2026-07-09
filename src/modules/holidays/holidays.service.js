const ApiError = require('../../utils/ApiError');
const repo = require('./holidays.repository');

async function list(schoolId, pagination) {
  return repo.findAll(schoolId, pagination);
}

async function listByMonth(schoolId, year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  return repo.findByDateRange(schoolId, startDate, endDate);
}

async function create(data) {
  return repo.create(data);
}

async function getById(id, schoolId) {
  const holiday = await repo.findById(id, schoolId);
  if (!holiday) throw new ApiError(404, 'Holiday not found');
  return holiday;
}

async function update(id, data, schoolId) {
  await getById(id, schoolId);
  return repo.update(id, data, schoolId);
}

async function remove(id, schoolId) {
  await getById(id, schoolId);
  await repo.remove(id, schoolId);
  return { message: 'Holiday deleted successfully' };
}

module.exports = { list, listByMonth, create, getById, update, remove };
