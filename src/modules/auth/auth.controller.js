const authService = require('./auth.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.validated;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { token } = req.validated;
    const result = await authService.refresh(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.validated;
    const result = await authService.changePassword(req.user.userId, oldPassword, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, changePassword };
