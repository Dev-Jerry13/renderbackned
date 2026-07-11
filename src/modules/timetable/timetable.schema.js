const { z } = require('zod');

const createTimetableSchema = z.object({
  class_id: z.string().uuid('Invalid class ID'),
  subject_id: z.string().uuid('Invalid subject ID'),
  teacher_id: z.string().uuid('Invalid teacher ID'),
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
  room: z.string().max(50).nullable().optional(),
});

const updateTimetableSchema = z.object({
  subject_id: z.string().uuid().nullable().optional(),
  teacher_id: z.string().uuid().nullable().optional(),
  day: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat']).nullable().optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable().optional(),
  room: z.string().max(50).nullable().optional(),
});

module.exports = { createTimetableSchema, updateTimetableSchema };
