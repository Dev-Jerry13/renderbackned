const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./timetable.controller');
const { createTimetableSchema, updateTimetableSchema } = require('./timetable.schema');

const router = Router();

router.get('/', allow('admin', 'teacher', 'student'), controller.list);
router.post('/', allow('admin'), validate(createTimetableSchema), controller.create);
router.put('/:id', allow('admin'), validate(updateTimetableSchema), controller.update);
router.delete('/:id', allow('admin'), controller.remove);

module.exports = router;
