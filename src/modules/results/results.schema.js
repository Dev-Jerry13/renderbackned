const { z } = require('zod');

const bulkResultSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  marks: z.array(z.object({
    studentId: z.string().uuid('Invalid student ID'),
    marksObtained: z.number().min(0, 'Marks cannot be negative'),
  })).min(1, 'At least one mark entry required'),
});

const listResultsQuerySchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  classId: z.string().uuid('Invalid class ID').optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

module.exports = { bulkResultSchema, listResultsQuerySchema };
