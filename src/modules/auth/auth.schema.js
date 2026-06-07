const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const refreshSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

module.exports = { loginSchema, changePasswordSchema, refreshSchema };
