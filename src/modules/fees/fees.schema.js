const { z } = require('zod');

const createFeeStructureSchema = z.object({
  fee_type: z.string().min(1, 'Fee type is required'),
  amount: z.number().positive('Amount must be positive'),
  class_id: z.string().uuid().optional().nullable(),
});

const recordPaymentSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  fee_structure_id: z.string().uuid('Invalid fee structure ID').optional().nullable(),
  amount_paid: z.number().positive('Amount must be positive'),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  payment_mode: z.string().optional(),
});

module.exports = { createFeeStructureSchema, recordPaymentSchema };
