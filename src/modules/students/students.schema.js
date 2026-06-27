const { z } = require('zod');
const { passwordSchema } = require('../auth/auth.schema');

const createStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required'),
  class_id: z.string().uuid('Invalid class ID'),
  roll_number: z.string().optional(),
  dob: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  emergency_contact: z.string().optional(),
});

const updateStudentSchema = z.object({
  full_name: z.string().min(1).optional(),
  class_id: z.string().uuid().optional(),
  roll_number: z.string().optional(),
  dob: z.string().optional(),
  parent_name: z.string().optional(),
  parent_phone: z.string().optional(),
  emergency_contact: z.string().optional(),
  is_active: z.boolean().optional(),
});

module.exports = { createStudentSchema, updateStudentSchema };
