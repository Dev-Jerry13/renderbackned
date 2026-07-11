const { z } = require('zod');

const createHolidaySchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  type: z.enum(['holiday', 'event']).nullable().optional().default('holiday'),
  is_recurring: z.boolean().nullable().optional().default(false),
});

const updateHolidaySchema = z.object({
  title: z.string().min(1).max(150).nullable().optional(),
  description: z.string().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').nullable().optional(),
  type: z.enum(['holiday', 'event']).nullable().optional(),
  is_recurring: z.boolean().nullable().optional(),
});

module.exports = { createHolidaySchema, updateHolidaySchema };
