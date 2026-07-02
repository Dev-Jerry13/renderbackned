const { z } = require('zod');
const { passwordSchema } = require('../auth/auth.schema');

const createStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required').max(100),
  class_id: z.string().uuid('Invalid class ID'),
  roll_number: z.string().max(20).optional(),
  dob: z.string().optional(),
  parent_name: z.string().max(100).optional(),
  parent_phone: z.string().max(20).optional(),
  emergency_contact: z.string().max(20).optional(),
});

const updateStudentSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  class_id: z.string().uuid().optional(),
  roll_number: z.string().max(20).optional(),
  dob: z.string().optional(),
  parent_name: z.string().max(100).optional(),
  parent_phone: z.string().max(20).optional(),
  emergency_contact: z.string().max(20).optional(),
  is_active: z.boolean().optional(),
});

module.exports = { createStudentSchema, updateStudentSchema };
