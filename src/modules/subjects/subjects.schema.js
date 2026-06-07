const { z } = require('zod');

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
});

const assignSubjectSchema = z.object({
  teacher_id: z.string().uuid('Invalid teacher ID'),
  class_id: z.string().uuid('Invalid class ID'),
});

module.exports = { createSubjectSchema, assignSubjectSchema };
