const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./classes.controller');
const { createClassSchema, updateClassSchema } = require('./classes.schema');

const router = Router();

router.get('/', allow('admin', 'teacher', 'student'), controller.list);
router.post('/', allow('admin'), validate(createClassSchema), controller.create);
router.get('/:id', allow('admin', 'teacher', 'student'), controller.getById);
router.put('/:id', allow('admin'), validate(updateClassSchema), controller.update);
router.get('/:id/students', allow('admin', 'teacher'), controller.getStudents);
router.get('/:id/timetable', allow('admin', 'teacher', 'student'), controller.getTimetable);

module.exports = router;
