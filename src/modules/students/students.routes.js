const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const studentSelf = require('../../middleware/studentSelf');
const controller = require('./students.controller');
const { createStudentSchema, updateStudentSchema, promoteStudentsSchema, activateStudentSchema } = require('./students.schema');

const router = Router();

router.get('/', allow('admin'), controller.list);
router.post('/', allow('admin'), validate(createStudentSchema), controller.create);
router.post('/promote', allow('admin'), validate(promoteStudentsSchema), controller.promote);
router.get('/:id', allow('admin', 'student', 'teacher'), studentSelf, controller.getById);
router.put('/:id', allow('admin'), validate(updateStudentSchema), controller.update);
router.delete('/:id', allow('admin'), controller.remove);
router.patch('/:id/activate', allow('admin'), validate(activateStudentSchema), controller.activate);

module.exports = router;
