const { z } = require('zod');

const createExamSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

const publishExamSchema = z.object({
  is_published: z.boolean(),
});

module.exports = { createExamSchema, publishExamSchema };
