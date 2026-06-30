const submissionService = require('./submissions.service');

async function listSubmissions(req, res, next) {
  try {
    const submissions = await submissionService.listSubmissions(req.params.assignmentId);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

async function updateSubmission(req, res, next) {
  try {
    const submission = await submissionService.updateSubmission(
      req.params.assignmentId,
      req.params.studentId,
      req.validated
    );
    res.json(submission);
  } catch (err) {
    next(err);
  }
}

async function bulkUpdateSubmissions(req, res, next) {
  try {
    const submissions = await submissionService.bulkUpdateSubmissions(
      req.params.assignmentId,
      req.validated.submissions
    );
    res.json(submissions);
  } catch (err) {
    next(err);
  }
}

module.exports = { listSubmissions, updateSubmission, bulkUpdateSubmissions };
