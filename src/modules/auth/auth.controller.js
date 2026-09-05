const authService = require('./auth.service');

async function login(req, res) {
  const { email, password } = req.validated;
  const result = await authService.login(email, password);
  res.json(result);
}

async function refresh(req, res) {
  const { token } = req.validated;
  const result = await authService.refresh(token);
  res.json(result);
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.validated;
  const result = await authService.changePassword(req.user.userId, oldPassword, newPassword);
  res.json(result);
}

module.exports = { login, refresh, changePassword };
