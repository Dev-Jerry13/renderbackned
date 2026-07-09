const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./staff.controller');
const { createStaffSchema, updateStaffSchema } = require('./staff.schema');

const router = Router();

router.get('/', allow('admin'), controller.list);
router.post('/', allow('admin'), validate(createStaffSchema), controller.create);
router.get('/departments', allow('admin'), controller.getDepartments);
router.get('/:id', allow('admin'), controller.getById);
router.put('/:id', allow('admin'), validate(updateStaffSchema), controller.update);
router.delete('/:id', allow('admin'), controller.remove);

module.exports = router;
