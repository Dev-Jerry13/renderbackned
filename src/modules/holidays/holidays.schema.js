const { z } = require('zod');

const createHolidaySchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  type: z.enum(['holiday', 'event']).optional().default('holiday'),
  is_recurring: z.boolean().optional().default(false),
});

const updateHolidaySchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  type: z.enum(['holiday', 'event']).optional(),
  is_recurring: z.boolean().optional(),
});

module.exports = { createHolidaySchema, updateHolidaySchema };
