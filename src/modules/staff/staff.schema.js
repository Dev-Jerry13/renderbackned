const { z } = require('zod');

const createStaffSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().max(30).nullable().optional(),
  department: z.string().max(100).nullable().optional(),
  designation: z.string().max(100).nullable().optional(),
  salary: z.number().min(0).nullable().optional(),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').nullable().optional(),
});

const updateStaffSchema = z.object({
  full_name: z.string().min(1).max(100).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  department: z.string().max(100).nullable().optional(),
  designation: z.string().max(100).nullable().optional(),
  salary: z.number().min(0).nullable().optional(),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  is_active: z.boolean().nullable().optional(),
});

module.exports = { createStaffSchema, updateStaffSchema };
