const { z } = require('zod');

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').nullable().optional(),
  class_id: z.string().uuid('Invalid class ID'),
  subject_id: z.string().uuid('Invalid subject ID'),
  teacher_id: z.string().uuid('Invalid teacher ID').nullable().optional(),
});

const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(200).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

module.exports = { createAssignmentSchema, updateAssignmentSchema };
