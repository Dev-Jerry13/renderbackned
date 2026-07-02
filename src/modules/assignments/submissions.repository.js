const db = require('../../config/db');

async function findByAssignment(assignmentId, schoolId) {
  const assignment = await db('assignments')
    .join('classes', 'assignments.class_id', 'classes.id')
    .where('assignments.id', assignmentId)
    .where('classes.school_id', schoolId)
    .select('assignments.class_id')
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

async function findOne(assignmentId, studentId, schoolId) {
  return db('assignment_submissions')
    .join('assignments', 'assignment_submissions.assignment_id', 'assignments.id')
    .join('classes', 'assignments.class_id', 'classes.id')
    .where('assignment_submissions.assignment_id', assignmentId)
    .where('assignment_submissions.student_id', studentId)
    .where('classes.school_id', schoolId)
    .select('assignment_submissions.*')
    .first();
}

async function upsert(assignmentId, studentId, data, schoolId) {
  const existing = await findOne(assignmentId, studentId, schoolId);
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

async function bulkUpsert(assignmentId, submissions, schoolId) {
  const results = [];
  for (const sub of submissions) {
    const result = await upsert(assignmentId, sub.student_id, {
      status: sub.status,
      remarks: sub.remarks || null,
    }, schoolId);
    results.push(result);
  }
  return results;
}

async function getStudentSubmission(assignmentId, studentId, schoolId) {
  return db('assignment_submissions')
    .join('assignments', 'assignment_submissions.assignment_id', 'assignments.id')
    .join('classes', 'assignments.class_id', 'classes.id')
    .where('assignment_submissions.assignment_id', assignmentId)
    .where('assignment_submissions.student_id', studentId)
    .where('classes.school_id', schoolId)
    .select('assignment_submissions.*')
    .first();
}

module.exports = { findByAssignment, findOne, upsert, bulkUpsert, getStudentSubmission };
