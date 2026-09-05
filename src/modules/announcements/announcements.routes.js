const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./announcements.controller');
const { createAnnouncementSchema, updateAnnouncementSchema } = require('./announcements.schema');

const router = Router();

router.get('/', allow('admin', 'teacher', 'student'), controller.list);
router.get('/teacher/:teacherId', allow('admin', 'teacher'), controller.listByTeacher);
router.post('/', allow('admin', 'teacher'), validate(createAnnouncementSchema), controller.create);
router.get('/:id', allow('admin', 'teacher', 'student'), controller.getById);
router.put('/:id', allow('admin', 'teacher'), validate(updateAnnouncementSchema), controller.update);
router.delete('/:id', allow('admin', 'teacher'), controller.remove);

module.exports = router;
