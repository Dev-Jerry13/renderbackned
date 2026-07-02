const { z } = require('zod');

const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(50),
  section: z.string().min(1, 'Section is required').max(10),
  class_teacher_id: z.string().uuid().nullish(),
});

const updateClassSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  section: z.string().min(1).max(10).optional(),
  class_teacher_id: z.string().uuid().nullish(),
});

module.exports = { createClassSchema, updateClassSchema };
