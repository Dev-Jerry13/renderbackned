const { z } = require('zod');

const bulkResultSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  subjectId: z.string().uuid('Invalid subject ID'),
  marks: z.array(z.object({
    studentId: z.string().uuid('Invalid student ID'),
    marksObtained: z.number().min(0, 'Marks cannot be negative'),
  })).min(1, 'At least one mark entry required'),
});

module.exports = { bulkResultSchema };
