const { z } = require('zod');

const markAttendanceSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  records: z.array(z.object({
    studentId: z.string().uuid('Invalid student ID'),
    status: z.enum(['present', 'absent', 'late']),
  })).min(1, 'At least one record required'),
});

const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late']),
});

module.exports = { markAttendanceSchema, updateAttendanceSchema };
