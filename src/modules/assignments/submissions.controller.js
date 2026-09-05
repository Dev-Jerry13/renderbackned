const submissionService = require('./submissions.service');

async function listSubmissions(req, res) {
  const submissions = await submissionService.listSubmissions(req.params.assignmentId, req.user.schoolId);
  res.json(submissions);
}

async function updateSubmission(req, res) {
  const submission = await submissionService.updateSubmission(
    req.params.assignmentId,
    req.params.studentId,
    req.validated,
    req.user.schoolId
  );
  res.json(submission);
}

async function bulkUpdateSubmissions(req, res) {
  const submissions = await submissionService.bulkUpdateSubmissions(
    req.params.assignmentId,
    req.validated.submissions,
    req.user.schoolId
  );
  res.json(submissions);
}

module.exports = { listSubmissions, updateSubmission, bulkUpdateSubmissions };
