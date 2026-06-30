const ApiError = require('../../utils/ApiError');
const assignmentRepo = require('./assignments.repository');
const submissionRepo = require('./submissions.repository');

async function listSubmissions(assignmentId) {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return submissionRepo.findByAssignment(assignmentId);
}

async function updateSubmission(assignmentId, studentId, data) {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return submissionRepo.upsert(assignmentId, studentId, data);
}

async function bulkUpdateSubmissions(assignmentId, submissions) {
  const assignment = await assignmentRepo.findById(assignmentId);
  if (!assignment) throw new ApiError(404, 'Assignment not found');
  return submissionRepo.bulkUpsert(assignmentId, submissions);
}

module.exports = { listSubmissions, updateSubmission, bulkUpdateSubmissions };
