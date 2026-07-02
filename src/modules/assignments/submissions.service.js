const ApiError = require('../../utils/ApiError');
const assignmentRepo = require('./assignments.repository');
const submissionRepo = require('./submissions.repository');

async function listSubmissions(assignmentId, schoolId) {
  const assignment = await assignmentRepo.findById(assignmentId, schoolId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return submissionRepo.findByAssignment(assignmentId, schoolId);
}

async function updateSubmission(assignmentId, studentId, data, schoolId) {
  const assignment = await assignmentRepo.findById(assignmentId, schoolId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return submissionRepo.upsert(assignmentId, studentId, data, schoolId);
}

async function bulkUpdateSubmissions(assignmentId, submissions, schoolId) {
  const assignment = await assignmentRepo.findById(assignmentId, schoolId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return submissionRepo.bulkUpsert(assignmentId, submissions, schoolId);
}

module.exports = { listSubmissions, updateSubmission, bulkUpdateSubmissions };
