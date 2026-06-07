const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./exams.controller');
const { createExamSchema, publishExamSchema } = require('./exams.schema');

const router = Router();

router.get('/', allow('admin', 'teacher', 'student'), controller.list);
router.post('/', allow('admin'), validate(createExamSchema), controller.create);
router.patch('/:id/publish', allow('admin'), validate(publishExamSchema), controller.publish);

module.exports = router;
