const { z } = require('zod');

const createFeeStructureSchema = z.object({
  fee_type: z.string().min(1, 'Fee type is required').max(50),
  amount: z.number().positive('Amount must be positive'),
  class_id: z.string().uuid().nullable().optional(),
});

const recordPaymentSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  fee_structure_id: z.string().uuid('Invalid fee structure ID').nullable().optional(),
  amount_paid: z.number().positive('Amount must be positive'),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  payment_mode: z.string().max(50).nullable().optional(),
  status: z.enum(['paid', 'pending']).nullable().optional().default('paid'),
});

const feeStructureItemSchema = z.object({
  fee_type: z.string().min(1, 'Fee type is required').max(50),
  amount: z.number().positive('Amount must be positive'),
  class_id: z.string().uuid().nullable().optional(),
});

const createFeePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').nullable().optional(),
  structures: z.array(feeStructureItemSchema).min(1, 'At least one fee structure is required'),
});

module.exports = { createFeeStructureSchema, recordPaymentSchema, createFeePostSchema };
