const { z } = require('zod');

const remarkTypes = ['praise', 'complaint'];
const remarkCategories = ['academics', 'behavior', 'attendance', 'general', 'other'];

const createRemarkSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  type: z.enum(remarkTypes, { errorMap: () => ({ message: 'Type must be praise or complaint' }) }),
  category: z.enum(remarkCategories).optional().nullable(),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be under 1000 characters'),
});

module.exports = { createRemarkSchema };
