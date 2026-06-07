const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./results.controller');
const { bulkResultSchema } = require('./results.schema');

const router = Router();

router.post('/bulk', allow('admin', 'teacher'), validate(bulkResultSchema), controller.bulk);
router.get('/', allow('admin', 'teacher'), controller.list);
router.get('/student/:id', allow('admin', 'student', 'teacher'), controller.getByStudent);

module.exports = router;
