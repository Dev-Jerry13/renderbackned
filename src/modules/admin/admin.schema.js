const { z } = require('zod');

const updateSchoolSchema = z.object({
  name: z.string().min(1).max(200).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  email: z.string().email().nullable().optional(),
  website: z.string().max(200).nullable().optional(),
  logo_url: z.string().max(500).nullable().optional(),
  academic_year: z.string().max(20).nullable().optional(),
  established_year: z.string().max(10).nullable().optional(),
});

module.exports = { updateSchoolSchema };
