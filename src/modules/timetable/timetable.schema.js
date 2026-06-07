const { z } = require('zod');

const createTimetableSchema = z.object({
  class_id: z.string().uuid('Invalid class ID'),
  subject_id: z.string().uuid('Invalid subject ID'),
  teacher_id: z.string().uuid('Invalid teacher ID'),
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
});

const updateTimetableSchema = z.object({
  subject_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
});

module.exports = { createTimetableSchema, updateTimetableSchema };
