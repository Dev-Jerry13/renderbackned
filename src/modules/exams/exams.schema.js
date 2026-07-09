const { z } = require('zod');

const createExamSchema = z.object({
  name: z.string().min(1, 'Exam name is required').max(100),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

const publishExamSchema = z.object({
  is_published: z.boolean(),
});

const examSubjectSchema = z.object({
  subject_id: z.string().uuid(),
  max_marks: z.number().min(1),
  passing_marks: z.number().min(0).optional(),
});

module.exports = { createExamSchema, publishExamSchema, examSubjectSchema };
