const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./assignments.controller');
const { createAssignmentSchema, updateAssignmentSchema } = require('./assignments.schema');

const router = Router();

router.get('/', allow('admin', 'teacher', 'student'), controller.list);
router.post('/', allow('admin', 'teacher'), validate(createAssignmentSchema), controller.create);
router.put('/:id', allow('admin', 'teacher'), validate(updateAssignmentSchema), controller.update);
router.delete('/:id', allow('admin', 'teacher'), controller.remove);

module.exports = router;
