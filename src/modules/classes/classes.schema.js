const { z } = require('zod');

const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  section: z.string().min(1, 'Section is required'),
  class_teacher_id: z.string().uuid().nullable().optional(),
});

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  section: z.string().min(1).optional(),
  class_teacher_id: z.string().uuid().nullable().optional(),
});

module.exports = { createClassSchema, updateClassSchema };
