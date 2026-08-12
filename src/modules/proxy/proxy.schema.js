const { z } = require('zod');

const assignProxySchema = z.object({
  timetable_id: z.string().uuid('Invalid timetable ID'),
  proxy_teacher_id: z.string().uuid('Invalid teacher ID'),
  reason: z.string().max(500).nullable().optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional(),
});

const respondProxySchema = z.object({
  status: z.enum(['accepted', 'rejected'], {
    errorMap: () => ({ message: 'Status must be accepted or rejected' }),
  }),
});

module.exports = { assignProxySchema, respondProxySchema };
