const { z } = require('zod');

const createStaffSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().max(30).optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  salary: z.number().min(0).optional(),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

const updateStaffSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(30).optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  salary: z.number().min(0).optional(),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_active: z.boolean().optional(),
});

module.exports = { createStaffSchema, updateStaffSchema };
