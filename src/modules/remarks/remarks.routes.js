const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./remarks.controller');
const { createRemarkSchema } = require('./remarks.schema');

const router = Router();

router.post('/', allow('admin', 'teacher'), validate(createRemarkSchema), controller.createRemark);
router.get('/student/:id', allow('admin', 'student', 'teacher'), controller.getStudentRemarks);
router.get('/teacher/:id', allow('admin', 'teacher'), controller.getTeacherRemarks);
router.get('/teacher/:teacherId/student/:studentId', allow('admin', 'teacher'), controller.getRemarksByStudentAndTeacher);
router.patch('/:id/read', allow('admin', 'student'), controller.markRead);

module.exports = router;
