const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().optional(),
  class_id: z.string().uuid('Invalid class ID').nullable().optional(),
});

const updateAnnouncementSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().optional(),
  class_id: z.string().uuid().nullable().optional(),
});

module.exports = { createAnnouncementSchema, updateAnnouncementSchema };
