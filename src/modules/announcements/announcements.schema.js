const { z } = require('zod');

const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().max(5000).optional(),
  class_id: z.string().uuid('Invalid class ID').nullable().optional(),
});

const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().max(5000).optional(),
  class_id: z.string().uuid().nullable().optional(),
});

module.exports = { createAnnouncementSchema, updateAnnouncementSchema };
