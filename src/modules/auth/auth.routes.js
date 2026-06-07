const { Router } = require('express');
const validate = require('../../middleware/validate');
const auth = require('../../middleware/auth');
const controller = require('./auth.controller');
const { loginSchema, refreshSchema, changePasswordSchema } = require('./auth.schema');

const router = Router();

router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshSchema), controller.refresh);
router.post('/change-password', auth, validate(changePasswordSchema), controller.changePassword);

module.exports = router;
