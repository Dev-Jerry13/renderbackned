const bcrypt = require('bcryptjs');

exports.seed = async (knex) => {
  await knex('announcements').del();
  await knex('timetable').del();
  await knex('assignments').del();
  await knex('results').del();
  await knex('exams').del();
  await knex('attendance').del();
  await knex('teacher_assignments').del();
  await knex('students').del();
  await knex('teachers').del();
  await knex('subjects').del();
  await knex('classes').del();
  await knex('users').del();
  await knex('schools').del();

  const hash = await bcrypt.hash('password123', 12);

  const [school] = await knex('schools').insert({
    name: 'Springfield Academy',
    logo_url: null,
    academic_year: '2025-2026',
  }).returning('*');

  const [admin1] = await knex('users').insert({
    school_id: school.id,
    email: 'admin@school.com',
    password_hash: hash,
    role: 'admin',
  }).returning('*');

  const [admin2] = await knex('users').insert({
    school_id: school.id,
    email: 'admin2@school.com',
    password_hash: hash,
    role: 'admin',
  }).returning('*');

  const [teacherUser1] = await knex('users').insert({
    school_id: school.id,
    email: 'teacher1@school.com',
    password_hash: hash,
    role: 'teacher',
  }).returning('*');

  const [teacherUser2] = await knex('users').insert({
    school_id: school.id,
    email: 'teacher2@school.com',
    password_hash: hash,
    role: 'teacher',
  }).returning('*');

  const [teacher1] = await knex('teachers').insert({
    user_id: teacherUser1.id,
    full_name: 'John Smith',
    phone: '555-0101',
  }).returning('*');

  const [teacher2] = await knex('teachers').insert({
    user_id: teacherUser2.id,
    full_name: 'Sarah Johnson',
    phone: '555-0102',
  }).returning('*');

  const [class8A] = await knex('classes').insert({
    school_id: school.id,
    name: 'Class 8',
    section: 'A',
    class_teacher_id: teacherUser1.id,
  }).returning('*');

  const [class8B] = await knex('classes').insert({
    school_id: school.id,
    name: 'Class 8',
    section: 'B',
    class_teacher_id: teacherUser2.id,
  }).returning('*');

  const subjects = await knex('subjects').insert([
    { school_id: school.id, name: 'Mathematics' },
    { school_id: school.id, name: 'Science' },
    { school_id: school.id, name: 'English' },
    { school_id: school.id, name: 'Social Science' },
  ]).returning('*');

  const [math, science, english, social] = subjects;

  await knex('teacher_assignments').insert([
    { teacher_id: teacher1.id, class_id: class8A.id, subject_id: math.id },
    { teacher_id: teacher1.id, class_id: class8B.id, subject_id: math.id },
    { teacher_id: teacher2.id, class_id: class8A.id, subject_id: science.id },
    { teacher_id: teacher2.id, class_id: class8B.id, subject_id: science.id },
  ]);

  const studentData = [
    { fullName: 'Alice Williams', roll: '1', classId: class8A.id, email: 'alice@school.com' },
    { fullName: 'Bob Martinez', roll: '2', classId: class8A.id, email: 'bob@school.com' },
    { fullName: 'Charlie Lee', roll: '3', classId: class8A.id, email: 'charlie@school.com' },
    { fullName: 'Diana Chen', roll: '4', classId: class8A.id, email: 'diana@school.com' },
    { fullName: 'Eva Patel', roll: '1', classId: class8B.id, email: 'eva@school.com' },
    { fullName: 'Frank Kim', roll: '2', classId: class8B.id, email: 'frank@school.com' },
    { fullName: 'Grace Thompson', roll: '3', classId: class8B.id, email: 'grace@school.com' },
    { fullName: 'Henry Davis', roll: '4', classId: class8B.id, email: 'henry@school.com' },
  ];

  const students = [];

  for (const s of studentData) {
    const [user] = await knex('users').insert({
      school_id: school.id,
      email: s.email,
      password_hash: hash,
      role: 'student',
    }).returning('*');

    const [student] = await knex('students').insert({
      user_id: user.id,
      class_id: s.classId,
      roll_number: s.roll,
      full_name: s.fullName,
      parent_name: `Parent of ${s.fullName}`,
      parent_phone: '555-0000',
      emergency_contact: '555-9999',
    }).returning('*');

    students.push(student);
  }

  const [alice, bob, charlie, diana, eva, frank, grace, henry] = students;

  // --- Timetable ---
  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const times = [
    { start: '08:00', end: '08:45' },
    { start: '08:50', end: '09:35' },
    { start: '09:40', end: '10:25' },
    { start: '10:40', end: '11:25' },
    { start: '11:30', end: '12:15' },
  ];

  for (const day of days) {
    await knex('timetable').insert([
      { class_id: class8A.id, subject_id: math.id, teacher_id: teacher1.id, day, start_time: times[0].start, end_time: times[0].end },
      { class_id: class8A.id, subject_id: science.id, teacher_id: teacher2.id, day, start_time: times[1].start, end_time: times[1].end },
      { class_id: class8A.id, subject_id: english.id, teacher_id: teacher1.id, day, start_time: times[2].start, end_time: times[2].end },
      { class_id: class8B.id, subject_id: math.id, teacher_id: teacher1.id, day, start_time: times[0].start, end_time: times[0].end },
      { class_id: class8B.id, subject_id: science.id, teacher_id: teacher2.id, day, start_time: times[1].start, end_time: times[1].end },
      { class_id: class8B.id, subject_id: social.id, teacher_id: teacher2.id, day, start_time: times[2].start, end_time: times[2].end },
    ]);
  }

  // --- Attendance (last 5 days) ---
  const today = new Date();
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const statuses = ['present', 'present', 'present', 'present', 'present', 'absent', 'late', 'present'];

    for (let j = 0; j < students.length; j++) {
      await knex('attendance').insert({
        student_id: students[j].id,
        class_id: students[j].class_id,
        date: dateStr,
        status: statuses[j] || 'present',
        marked_by: teacherUser1.id,
      });
    }
  }

  // --- Exams ---
  const [exam1] = await knex('exams').insert({
    school_id: school.id,
    name: 'Unit Test 1',
    exam_date: '2025-08-15',
    is_published: true,
  }).returning('*');

  const [exam2] = await knex('exams').insert({
    school_id: school.id,
    name: 'Mid Term',
    exam_date: '2025-10-01',
    is_published: false,
  }).returning('*');

  // --- Results ---
  const class8AStudents = [alice, bob, charlie, diana];
  for (const s of class8AStudents) {
    await knex('results').insert([
      { exam_id: exam1.id, student_id: s.id, subject_id: math.id, marks_obtained: 85, total_marks: 100 },
      { exam_id: exam1.id, student_id: s.id, subject_id: science.id, marks_obtained: 78, total_marks: 100 },
      { exam_id: exam1.id, student_id: s.id, subject_id: english.id, marks_obtained: 92, total_marks: 100 },
    ]);
  }

  // --- Assignments ---
  await knex('assignments').insert([
    { teacher_id: teacher1.id, class_id: class8A.id, subject_id: math.id, title: 'Algebra Worksheet', description: 'Solve equations 1-20 from Chapter 3', due_date: '2025-08-20' },
    { teacher_id: teacher1.id, class_id: class8B.id, subject_id: math.id, title: 'Geometry Practice', description: 'Complete exercises 5.1 to 5.5', due_date: '2025-08-22' },
    { teacher_id: teacher2.id, class_id: class8A.id, subject_id: science.id, title: 'Lab Report: Photosynthesis', description: 'Write a detailed lab report on the photosynthesis experiment', due_date: '2025-08-18' },
  ]);

  // --- Announcements ---
  await knex('announcements').insert([
    { school_id: school.id, created_by: admin1.id, title: 'School Holiday', body: 'School will remain closed on Aug 15th for Independence Day.', class_id: null },
    { school_id: school.id, created_by: teacherUser1.id, title: 'Math Quiz Next Week', body: 'There will be a surprise quiz on Algebra next Monday.', class_id: class8A.id },
    { school_id: school.id, created_by: teacherUser2.id, title: 'Science Project Submission', body: 'Please submit your science projects by Friday.', class_id: class8B.id },
  ]);
};
