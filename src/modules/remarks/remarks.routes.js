const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const studentSelf = require('../../middleware/studentSelf');
const controller = require('./remarks.controller');
const { createRemarkSchema, updateRemarkSchema } = require('./remarks.schema');

const router = Router();

router.post('/', allow('teacher'), validate(createRemarkSchema), controller.createRemark);
router.get('/student/:id', allow('admin', 'student', 'teacher'), studentSelf, controller.getStudentRemarks);
router.get('/teacher/:id', allow('admin', 'teacher'), controller.getTeacherRemarks);
router.get('/teacher/:teacherId/student/:studentId', allow('admin', 'teacher'), controller.getRemarksByStudentAndTeacher);
router.patch('/:id/read', allow('student'), controller.markRead);
router.patch('/:id', allow('teacher'), validate(updateRemarkSchema), controller.updateRemark);
router.delete('/:id', allow('teacher'), controller.deleteRemark);

module.exports = router;
