const { z } = require('zod');

const remarkTypes = ['praise', 'complaint'];
const remarkCategories = ['academics', 'behavior', 'attendance', 'general', 'other'];

const createRemarkSchema = z.object({
  student_id: z.string().uuid('Invalid student ID'),
  type: z.enum(remarkTypes, { errorMap: () => ({ message: 'Type must be praise or complaint' }) }),
  category: z.enum(remarkCategories).nullable().optional(),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be under 1000 characters'),
});

const updateRemarkSchema = z.object({
  type: z.enum(remarkTypes, { errorMap: () => ({ message: 'Type must be praise or complaint' }) }).nullable().optional(),
  category: z.enum(remarkCategories).nullable().optional(),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be under 1000 characters').nullable().optional(),
});

module.exports = { createRemarkSchema, updateRemarkSchema };
