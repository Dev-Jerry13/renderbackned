const { z } = require('zod');

const rangeSchema = z.object({
  grade: z.string().min(1),
  min_percentage: z.number().min(0).max(100),
  max_percentage: z.number().min(0).max(100),
  grade_point: z.number().min(0).optional(),
  description: z.string().optional(),
});

const createGradingSystemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  is_active: z.boolean().optional(),
  ranges: z.array(rangeSchema).optional(),
});

const updateGradingSystemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
  ranges: z.array(rangeSchema).optional(),
});

module.exports = { createGradingSystemSchema, updateGradingSystemSchema };
