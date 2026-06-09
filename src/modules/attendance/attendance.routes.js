const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./attendance.controller');
const { markAttendanceSchema, updateAttendanceSchema } = require('./attendance.schema');

const router = Router();

router.post('/mark', allow('admin', 'teacher'), validate(markAttendanceSchema), controller.mark);
router.get('/', allow('admin', 'teacher'), controller.list);
router.get('/student/:id', allow('admin', 'teacher', 'student'), controller.getByStudent);
router.put('/:id', allow('admin', 'teacher'), validate(updateAttendanceSchema), controller.update);

module.exports = router;
