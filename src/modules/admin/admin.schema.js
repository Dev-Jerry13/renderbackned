const { z } = require('zod');

const updateSchoolSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().max(200).optional(),
  logo_url: z.string().max(500).optional(),
  academic_year: z.string().max(20).optional(),
  established_year: z.string().max(10).optional(),
});

module.exports = { updateSchoolSchema };
