const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./admin.controller');
const { updateSchoolSchema } = require('./admin.schema');

const router = Router();

router.get('/dashboard/stats', allow('admin'), controller.dashboardStats);
router.get('/school', allow('admin'), controller.getSchoolProfile);
router.put('/school', allow('admin'), validate(updateSchoolSchema), controller.updateSchoolProfile);

module.exports = router;
