const db = require('../../config/db');

async function findByAssignment(assignmentId) {
  const assignment = await db('assignments')
    .where({ id: assignmentId })
    .select('class_id')
    .first();
  if (!assignment) return [];

  return db('students')
    .leftJoin('assignment_submissions', function () {
      this.on('students.id', '=', 'assignment_submissions.student_id')
        .andOn('assignment_submissions.assignment_id', '=', db.raw('?', [assignmentId]));
    })
    .where('students.class_id', assignment.class_id)
    .select(
      'students.id as student_id',
      'students.full_name as student_name',
      'students.roll_number',
      db.raw("COALESCE(assignment_submissions.status, 'pending') as status"),
      'assignment_submissions.remarks',
      'assignment_submissions.id'
    )
    .orderBy('students.roll_number', 'asc');
}

async function findOne(assignmentId, studentId) {
  return db('assignment_submissions')
    .where({ assignment_id: assignmentId, student_id: studentId })
    .first();
}

async function upsert(assignmentId, studentId, data) {
  const existing = await findOne(assignmentId, studentId);
  if (existing) {
    const [submission] = await db('assignment_submissions')
      .where({ assignment_id: assignmentId, student_id: studentId })
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*');
    return submission;
  }
  const [submission] = await db('assignment_submissions')
    .insert({ assignment_id: assignmentId, student_id: studentId, ...data })
    .returning('*');
  return submission;
}

async function bulkUpsert(assignmentId, submissions) {
  const now = db.fn.now();
  const results = [];
  for (const sub of submissions) {
    const result = await upsert(assignmentId, sub.student_id, {
      status: sub.status,
      remarks: sub.remarks || null,
    });
    results.push(result);
  }
  return results;
}

async function getStudentSubmission(assignmentId, studentId) {
  return db('assignment_submissions')
    .where({ assignment_id: assignmentId, student_id: studentId })
    .first();
}

module.exports = { findByAssignment, findOne, upsert, bulkUpsert, getStudentSubmission };
