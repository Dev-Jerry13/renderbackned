const ApiError = require('../../utils/ApiError');
const repo = require('./fees.repository');

async function listStructures(schoolId) {
  return repo.findAllStructures(schoolId);
}

async function createStructure(data) {
  return repo.createStructure(data);
}

async function listPending(schoolId) {
  return repo.findPendingBySchool(schoolId);
}

async function recordPayment(data) {
  return repo.createPayment(data);
}

async function getByStudent(studentId) {
  return repo.findByStudent(studentId);
}

module.exports = { listStructures, createStructure, listPending, recordPayment, getByStudent };
