const remarkService = require('./remarks.service');

async function createRemark(req, res, next) {
  try {
    const remark = await remarkService.createRemark(
      req.validated,
      req.user.teacherId,
      req.user.schoolId
    );
    res.status(201).json(remark);
  } catch (err) {
    next(err);
  }
}

async function getStudentRemarks(req, res, next) {
  try {
    const remarks = await remarkService.getStudentRemarks(
      req.params.id,
      req.user.schoolId
    );
    res.json(remarks);
  } catch (err) {
    next(err);
  }
}

async function getTeacherRemarks(req, res, next) {
  try {
    const remarks = await remarkService.getTeacherRemarks(
      req.params.id,
      req.user.schoolId
    );
    res.json(remarks);
  } catch (err) {
    next(err);
  }
}

async function getRemarksByStudentAndTeacher(req, res, next) {
  try {
    const remarks = await remarkService.getRemarksByStudentAndTeacher(
      req.params.studentId,
      req.params.teacherId,
      req.user.schoolId
    );
    res.json(remarks);
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const remark = await remarkService.markRemarkAsRead(
      req.params.id,
      req.user.studentId,
      req.user.schoolId
    );
    res.json(remark);
  } catch (err) {
    next(err);
  }
}

module.exports = { createRemark, getStudentRemarks, getTeacherRemarks, getRemarksByStudentAndTeacher, markRead };
