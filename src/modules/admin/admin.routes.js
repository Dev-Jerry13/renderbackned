const { Router } = require('express');
const allow = require('../../middleware/rbac');
const controller = require('./admin.controller');

const router = Router();

router.get('/dashboard/stats', allow('admin'), controller.dashboardStats);

module.exports = router;
