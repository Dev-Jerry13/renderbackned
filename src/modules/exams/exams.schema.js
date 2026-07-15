const { z } = require('zod');

const createExamSchema = z.object({
  name: z.string().min(1, 'Exam name is required').max(100),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').nullable().optional(),
  class_ids: z.array(z.string().uuid('Invalid class ID')).min(1, 'At least one class is required'),
  publish_now: z.boolean().optional().default(false),
});

const publishExamSchema = z.object({
  is_published: z.boolean(),
});

const examSubjectSchema = z.object({
  subject_id: z.string().uuid(),
  max_marks: z.number().min(1),
  passing_marks: z.number().min(0).nullable().optional(),
});

module.exports = { createExamSchema, publishExamSchema, examSubjectSchema };
