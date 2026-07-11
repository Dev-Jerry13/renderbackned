const { z } = require('zod');

const rangeSchema = z.object({
  grade: z.string().min(1),
  min_percentage: z.number().min(0).max(100),
  max_percentage: z.number().min(0).max(100),
  grade_point: z.number().min(0).nullable().optional(),
  description: z.string().nullable().optional(),
});

const createGradingSystemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  is_active: z.boolean().nullable().optional(),
  ranges: z.array(rangeSchema).nullable().optional(),
});

const updateGradingSystemSchema = z.object({
  name: z.string().min(1).max(100).nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  ranges: z.array(rangeSchema).nullable().optional(),
});

module.exports = { createGradingSystemSchema, updateGradingSystemSchema };
