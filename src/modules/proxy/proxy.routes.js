const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./proxy.controller');
const { assignProxySchema, respondProxySchema } = require('./proxy.schema');

const router = Router();

router.post(
  '/assign',
  allow('admin', 'teacher'),
  validate(assignProxySchema),
  controller.assign
);

router.patch(
  '/:id/respond',
  allow('teacher'),
  validate(respondProxySchema),
  controller.respond
);

router.delete(
  '/:id',
  allow('admin', 'teacher'),
  controller.cancel
);

router.get(
  '/my',
  allow('teacher'),
  controller.myProxies
);

router.get(
  '/pending',
  allow('teacher'),
  controller.pendingRequests
);

router.get(
  '/today',
  allow('admin', 'teacher', 'student'),
  controller.todayForClass
);

router.get(
  '/available',
  allow('admin', 'teacher'),
  controller.available
);

router.get(
  '/teachers',
  allow('admin'),
  controller.teachers
);

router.get(
  '/admin/all',
  allow('admin'),
  controller.adminList
);

module.exports = router;
