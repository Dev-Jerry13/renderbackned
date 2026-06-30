const { Router } = require('express');
const validate = require('../../middleware/validate');
const allow = require('../../middleware/rbac');
const controller = require('./submissions.controller');
const { updateSubmissionSchema, bulkUpdateSubmissionsSchema } = require('./submissions.schema');

const router = Router({ mergeParams: true });

router.get('/', allow('admin', 'teacher'), controller.listSubmissions);
router.put('/', allow('admin', 'teacher'), validate(bulkUpdateSubmissionsSchema), controller.bulkUpdateSubmissions);
router.put('/:studentId', allow('admin', 'teacher'), validate(updateSubmissionSchema), controller.updateSubmission);

module.exports = router;
