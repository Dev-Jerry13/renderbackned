const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./exams.controller');
const { createExamSchema, publishExamSchema } = require('./exams.schema');

const router = Router();

router.get('/', allow('admin', 'teacher', 'student'), controller.list);
router.post('/', allow('admin'), validate(createExamSchema), controller.create);
router.get('/:id', allow('admin', 'teacher', 'student'), controller.getById);
router.patch('/:id/publish', allow('admin'), validate(publishExamSchema), controller.publish);
router.delete('/:id', allow('admin'), controller.remove);

module.exports = router;
