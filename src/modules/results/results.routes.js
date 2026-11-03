const { Router } = require('express');
const validate = require('../../middleware/validate');
const validateQuery = require('../../middleware/validateQuery');
const allow = require('../../middleware/rbac');
const studentSelf = require('../../middleware/studentSelf');
const controller = require('./results.controller');
const { bulkResultSchema, listResultsQuerySchema } = require('./results.schema');

const router = Router();

router.post('/bulk', allow('admin', 'teacher'), validate(bulkResultSchema), controller.bulk);
router.get('/', allow('admin', 'teacher'), validateQuery(listResultsQuerySchema), controller.list);
router.get('/student/:id', allow('admin', 'student', 'teacher'), studentSelf, controller.getByStudent);

module.exports = router;
