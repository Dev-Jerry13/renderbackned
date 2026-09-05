const { z } = require('zod');
const { passwordSchema } = require('../auth/auth.schema');

const createStudentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required').max(100),
  class_id: z.string().uuid('Invalid class ID'),
  roll_number: z.string().max(20).nullable().optional(),
  dob: z.string().nullable().optional(),
  parent_name: z.string().max(100).nullable().optional(),
  parent_phone: z.string().max(20).nullable().optional(),
  emergency_contact: z.string().max(20).nullable().optional(),
});

const updateStudentSchema = z.object({
  full_name: z.string().min(1).max(100).nullable().optional(),
  class_id: z.string().uuid().nullable().optional(),
  roll_number: z.string().max(20).nullable().optional(),
  dob: z.string().nullable().optional(),
  parent_name: z.string().max(100).nullable().optional(),
  parent_phone: z.string().max(20).nullable().optional(),
  emergency_contact: z.string().max(20).nullable().optional(),
  is_active: z.boolean().nullable().optional(),
});

const promoteStudentsSchema = z.object({
  from_class_id: z.string().uuid(),
  to_class_id: z.string().uuid(),
  academic_year: z.string().min(1),
  student_ids: z.array(z.string().uuid()).min(1, 'At least one student is required'),
  status: z.enum(['promoted', 'retained']).nullable().optional().default('promoted'),
});

const activateStudentSchema = z.object({
  is_active: z.boolean().optional(),
});

module.exports = { createStudentSchema, updateStudentSchema, promoteStudentsSchema, activateStudentSchema };
