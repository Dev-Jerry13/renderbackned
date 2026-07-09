const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./grading.controller');
const { createGradingSystemSchema, updateGradingSystemSchema } = require('./grading.schema');

const router = Router();

router.get('/', allow('admin', 'teacher'), controller.list);
router.get('/find-grade', allow('admin', 'teacher'), controller.findGrade);
router.get('/:id', allow('admin', 'teacher'), controller.getById);
router.post('/', allow('admin'), validate(createGradingSystemSchema), controller.create);
router.put('/:id', allow('admin'), validate(updateGradingSystemSchema), controller.update);
router.delete('/:id', allow('admin'), controller.remove);

module.exports = router;
