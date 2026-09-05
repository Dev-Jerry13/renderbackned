const ApiError = require('../../utils/ApiError');
const remarkService = require('./remarks.service');

async function createRemark(req, res) {
  if (!req.user.teacherId) {
    throw new ApiError(403, 'Only teachers can create remarks');
  }
  const remark = await remarkService.createRemark(
    req.validated,
    req.user.teacherId,
    req.user.schoolId
  );
  res.status(201).json(remark);
}

async function getStudentRemarks(req, res) {
  const remarks = await remarkService.getStudentRemarks(
    req.params.id,
    req.user.schoolId
  );
  res.json(remarks);
}

async function getTeacherRemarks(req, res) {
  const remarks = await remarkService.getTeacherRemarks(
    req.params.id,
    req.user.schoolId
  );
  res.json(remarks);
}

async function getRemarksByStudentAndTeacher(req, res) {
  const remarks = await remarkService.getRemarksByStudentAndTeacher(
    req.params.studentId,
    req.params.teacherId,
    req.user.schoolId
  );
  res.json(remarks);
}

async function markRead(req, res) {
  if (!req.user.studentId) {
    throw new ApiError(403, 'Only students can mark remarks as read');
  }
  const remark = await remarkService.markRemarkAsRead(
    req.params.id,
    req.user.studentId,
    req.user.schoolId
  );
  res.json(remark);
}

async function updateRemark(req, res) {
  if (!req.user.teacherId) {
    throw new ApiError(403, 'Only teachers can update remarks');
  }
  const remark = await remarkService.updateRemark(
    req.params.id,
    req.user.teacherId,
    req.user.schoolId,
    req.validated
  );
  res.json(remark);
}

async function deleteRemark(req, res) {
  if (!req.user.teacherId) {
    throw new ApiError(403, 'Only teachers can delete remarks');
  }
  await remarkService.deleteRemark(
    req.params.id,
    req.user.teacherId,
    req.user.schoolId
  );
  res.status(204).end();
}

module.exports = { createRemark, getStudentRemarks, getTeacherRemarks, getRemarksByStudentAndTeacher, markRead, updateRemark, deleteRemark };
