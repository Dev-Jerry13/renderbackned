const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./teachers.controller');
const { createTeacherSchema, updateTeacherSchema, teacherSubjectsSchema } = require('./teachers.schema');

const router = Router();

router.get('/', allow('admin'), controller.list);
router.post('/', allow('admin'), validate(createTeacherSchema), controller.create);
router.get('/:id', allow('admin', 'teacher'), controller.getById);
router.put('/:id', allow('admin'), validate(updateTeacherSchema), controller.update);
router.get('/:id/classes', allow('admin', 'teacher'), controller.getClasses);
router.get('/:id/class-teacher-class', allow('admin', 'teacher'), controller.getClassTeacherClass);
router.put('/:id/subjects', allow('admin'), validate(teacherSubjectsSchema), controller.setSubjects);
router.get('/:id/timetable', allow('admin', 'teacher'), controller.getTimetable);
router.delete('/:id', allow('admin'), controller.remove);

module.exports = router;
