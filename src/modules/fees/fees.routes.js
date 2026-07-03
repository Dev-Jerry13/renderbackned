const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./fees.controller');
const { createFeeStructureSchema, recordPaymentSchema, createFeePostSchema } = require('./fees.schema');

const router = Router();

router.get('/structures', allow('admin'), controller.listStructures);
router.post('/structures', allow('admin'), validate(createFeeStructureSchema), controller.createStructure);
router.get('/pending', allow('admin'), controller.listPending);
router.post('/payments', allow('admin'), validate(recordPaymentSchema), controller.recordPayment);
router.get('/student/:id', allow('admin', 'student'), controller.getByStudent);

router.post('/posts', allow('admin'), validate(createFeePostSchema), controller.createPost);
router.get('/posts', allow('admin'), controller.listPosts);
router.get('/posts/:id', allow('admin'), controller.getPost);

module.exports = router;
