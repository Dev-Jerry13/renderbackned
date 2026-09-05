const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const studentSelf = require('../../middleware/studentSelf');
const controller = require('./attendance.controller');
const { markAttendanceSchema, updateAttendanceSchema } = require('./attendance.schema');

const router = Router();

router.post('/mark', allow('admin', 'teacher'), validate(markAttendanceSchema), controller.mark);
router.get('/', allow('admin', 'teacher'), controller.list);
router.get('/student/:id', allow('admin', 'teacher', 'student'), studentSelf, controller.getByStudent);
router.put('/:id', allow('admin', 'teacher'), validate(updateAttendanceSchema), controller.update);

module.exports = router;
