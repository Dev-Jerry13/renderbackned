const { z } = require('zod');
const { passwordSchema } = require('../auth/auth.schema');

const createTeacherSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
});

const updateTeacherSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  is_active: z.boolean().optional(),
});

module.exports = { createTeacherSchema, updateTeacherSchema };
