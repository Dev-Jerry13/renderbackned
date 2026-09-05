const resultService = require('./results.service');

async function bulk(req, res) {
  const result = await resultService.bulkEntry(req.validated, req.user);
  res.json(result);
}

async function list(req, res) {
  const { examId, subjectId, classId, page, limit } = req.query;
  const result = await resultService.getByExamAndSubject(
    examId, subjectId, classId, req.user, { page, limit }
  );
  res.json(result);
}

async function getByStudent(req, res) {
  const results = await resultService.getByStudent(req.params.id, req.user.schoolId);
  res.json(results);
}

module.exports = { bulk, list, getByStudent };
