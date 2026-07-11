const { z } = require('zod');
const { passwordSchema } = require('../auth/auth.schema');

const createTeacherSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().max(20).nullable().optional(),
});

const updateTeacherSchema = z.object({
  full_name: z.string().min(1).max(100).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  is_active: z.boolean().nullable().optional(),
});

const teacherSubjectsSchema = z.object({
  subject_ids: z.array(z.string().uuid()).min(1, 'At least one subject required'),
});

module.exports = { createTeacherSchema, updateTeacherSchema, teacherSubjectsSchema };
