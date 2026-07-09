const { Router } = require('express');
const allow = require('../../middleware/rbac');
const controller = require('./reports.controller');

const router = Router();

router.get('/student-strength', allow('admin'), controller.studentStrength);
router.get('/attendance', allow('admin'), controller.attendance);
router.get('/fee-collection', allow('admin'), controller.feeCollection);
router.get('/teacher-workload', allow('admin'), controller.teacherWorkload);
router.get('/admissions', allow('admin'), controller.admissions);

module.exports = router;
