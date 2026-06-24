const resultService = require('./results.service');

async function bulk(req, res, next) {
  try {
    const result = await resultService.bulkEntry(req.validated);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { examId, subjectId, classId } = req.query;
    const results = await resultService.getByExamAndSubject(examId, subjectId, classId);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

async function getByStudent(req, res, next) {
  try {
    const results = await resultService.getByStudent(req.params.id);
    res.json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = { bulk, list, getByStudent };
