const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./subjects.controller');
const { createSubjectSchema, assignSubjectSchema } = require('./subjects.schema');

const router = Router();

router.get('/', allow('admin', 'teacher', 'student'), controller.list);
router.post('/', allow('admin'), validate(createSubjectSchema), controller.create);
router.post('/:id/assign', allow('admin'), validate(assignSubjectSchema), controller.assign);

module.exports = router;
