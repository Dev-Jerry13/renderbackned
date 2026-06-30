const { z } = require('zod');

const updateSubmissionSchema = z.object({
  status: z.enum(['pending', 'done', 'late']),
  remarks: z.string().optional(),
});

const bulkUpdateSubmissionsSchema = z.object({
  submissions: z.array(
    z.object({
      student_id: z.string().uuid('Invalid student ID'),
      status: z.enum(['pending', 'done', 'late']),
      remarks: z.string().optional(),
    })
  ),
});

module.exports = { updateSubmissionSchema, bulkUpdateSubmissionsSchema };
