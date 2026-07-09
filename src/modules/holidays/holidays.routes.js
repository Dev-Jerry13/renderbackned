const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./holidays.controller');
const { createHolidaySchema, updateHolidaySchema } = require('./holidays.schema');

const router = Router();

router.get('/',    allow('admin', 'teacher', 'student'), controller.list);
router.post('/',   allow('admin'),                       validate(createHolidaySchema), controller.create);
router.get('/:id', allow('admin', 'teacher', 'student'), controller.getById);
router.put('/:id',    allow('admin'),                    validate(updateHolidaySchema), controller.update);
router.delete('/:id', allow('admin'),                    controller.remove);

module.exports = router;
