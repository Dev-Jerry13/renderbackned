const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../config/db');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');

async function login(email, password) {
  const user = await db('users').where({ email, is_active: true }).first();
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  let teacherId, studentId;
  if (user.role === 'teacher') {
    const teacher = await db('teachers').where({ user_id: user.id }).first();
    teacherId = teacher?.id;
  } else if (user.role === 'student') {
    const student = await db('students').where({ user_id: user.id }).first();
    studentId = student?.id;
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, schoolId: user.school_id, teacherId, studentId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES }
  );

  return { token, role: user.role, userId: user.id, teacherId, studentId };
}

async function refresh(token) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await db('users').where({ id: decoded.userId, is_active: true }).first();
    if (!user) throw new ApiError(401, 'User not found');

    let teacherId, studentId;
    if (user.role === 'teacher') {
      const teacher = await db('teachers').where({ user_id: user.id }).first();
      teacherId = teacher?.id;
    } else if (user.role === 'student') {
      const student = await db('students').where({ user_id: user.id }).first();
      studentId = student?.id;
    }

    const newToken = jwt.sign(
      { userId: user.id, role: user.role, schoolId: user.school_id, teacherId, studentId },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES }
    );

    return { token: newToken, role: user.role };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(401, 'Invalid or expired token');
  }
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) throw new ApiError(404, 'User not found');

  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw new ApiError(400, 'Current password is incorrect');

  const password_hash = await bcrypt.hash(newPassword, 12);
  await db('users').where({ id: userId }).update({ password_hash });

  return { message: 'Password changed successfully' };
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

module.exports = { login, refresh, changePassword, hashPassword };
