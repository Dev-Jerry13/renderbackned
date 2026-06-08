const bcrypt = require('bcryptjs');

const HASH_ROUNDS = 12;

exports.seed = async (knex) => {
  // ──────────────────────────────────────────────
  // 1. Fetch existing school, users, classes, subjects
  // ──────────────────────────────────────────────
  const [school] = await knex('schools').where({ name: 'Springfield Academy' }).limit(1);

  if (!school) {
    console.log('No existing school found. Run 001_seed_core_data.js first.');
    return;
  }

  const existingUsers = await knex('users').where({ school_id: school.id });
  const existingTeachers = await knex('teachers');
  const existingClasses = await knex('classes').where({ school_id: school.id });
  const existingSubjects = await knex('subjects').where({ school_id: school.id });

  const userByEmail = {};
  for (const u of existingUsers) userByEmail[u.email] = u;

  const hash = await bcrypt.hash('password123', HASH_ROUNDS);

  // ──────────────────────────────────────────────
  // 2. Add new subjects
  // ──────────────────────────────────────────────
  const newSubjectNames = ['Hindi', 'Computer Science', 'Physics', 'Chemistry'];
  const existingSubjectNames = new Set(existingSubjects.map((s) => s.name));
  const subjectsToAdd = [];

  for (const name of newSubjectNames) {
    if (!existingSubjectNames.has(name)) {
      subjectsToAdd.push({ school_id: school.id, name });
    }
  }

  let addedSubjects = [];
  if (subjectsToAdd.length > 0) {
    addedSubjects = await knex('subjects').insert(subjectsToAdd).returning('*');
  }

  const allSubjects = [...existingSubjects, ...addedSubjects];
  const subjectByName = {};
  for (const s of allSubjects) subjectByName[s.name] = s;

  // ──────────────────────────────────────────────
  // 3. Add new users + teachers (teacher3, teacher4)
  // ──────────────────────────────────────────────
  const newTeacherAccounts = [
    { email: 'teacher3@school.com', fullName: 'Emily Brown', phone: '555-0103' },
    { email: 'teacher4@school.com', fullName: 'Michael Davis', phone: '555-0104' },
  ];

  const addedTeacherUsers = [];
  const addedTeacherProfiles = [];

  for (const t of newTeacherAccounts) {
    if (!userByEmail[t.email]) {
      const [user] = await knex('users')
        .insert({
          school_id: school.id,
          email: t.email,
          password_hash: hash,
          role: 'teacher',
        })
        .returning('*');

      const [profile] = await knex('teachers')
        .insert({ user_id: user.id, full_name: t.fullName, phone: t.phone })
        .returning('*');

      addedTeacherUsers.push(user);
      addedTeacherProfiles.push({ ...profile, email: t.email });
      userByEmail[t.email] = user;
    }
  }

  const allTeachers = [...existingTeachers, ...addedTeacherProfiles];
  const teacherByEmail = {};
  for (const t of allTeachers) {
    const user = userByEmail[t.email] || Object.values(userByEmail).find((u) => u.id === t.user_id);
    if (user) teacherByEmail[user.email] = t;
  }

  // ──────────────────────────────────────────────
  // 4. Add new classes (Class 9 A, Class 9 B, Class 10 A, Class 10 B)
  // ──────────────────────────────────────────────
  const newClassConfigs = [
    { name: 'Class 9', section: 'A' },
    { name: 'Class 9', section: 'B' },
    { name: 'Class 10', section: 'A' },
    { name: 'Class 10', section: 'B' },
  ];

  const existingClassKey = new Set();
  for (const c of existingClasses) existingClassKey.add(`${c.name}|${c.section}`);

  const addedClasses = [];

  for (const cfg of newClassConfigs) {
    if (!existingClassKey.has(`${cfg.name}|${cfg.section}`)) {
      const [cls] = await knex('classes')
        .insert({ school_id: school.id, name: cfg.name, section: cfg.section })
        .returning('*');
      addedClasses.push(cls);
    }
  }

  const allClasses = [...existingClasses, ...addedClasses];

  // ──────────────────────────────────────────────
  // 5. Teacher assignments (map teachers to new classes + subjects)
  // ──────────────────────────────────────────────
  const t1 = teacherByEmail['teacher1@school.com']; // John Smith — Math
  const t2 = teacherByEmail['teacher2@school.com']; // Sarah Johnson — Science
  const t3 = teacherByEmail['teacher3@school.com']; // Emily Brown — English
  const t4 = teacherByEmail['teacher4@school.com']; // Michael Davis — Social Science

  const newAssignments = [];

  for (const cls of addedClasses) {
    if (t1 && subjectByName['Mathematics']) {
      newAssignments.push({ teacher_id: t1.id, class_id: cls.id, subject_id: subjectByName['Mathematics'].id });
    }
    if (t2 && subjectByName['Science']) {
      newAssignments.push({ teacher_id: t2.id, class_id: cls.id, subject_id: subjectByName['Science'].id });
    }
    if (t3 && subjectByName['English']) {
      newAssignments.push({ teacher_id: t3.id, class_id: cls.id, subject_id: subjectByName['English'].id });
    }
    if (t4 && subjectByName['Social Science']) {
      newAssignments.push({ teacher_id: t4.id, class_id: cls.id, subject_id: subjectByName['Social Science'].id });
    }
    // Extra subjects for new classes
    if (t3 && subjectByName['Hindi']) {
      newAssignments.push({ teacher_id: t3.id, class_id: cls.id, subject_id: subjectByName['Hindi'].id });
    }
    if (t4 && subjectByName['Computer Science']) {
      newAssignments.push({ teacher_id: t4.id, class_id: cls.id, subject_id: subjectByName['Computer Science'].id });
    }
  }

  // Also assign t3, t4 to existing Class 8A and 8B for English / Social
  for (const cls of existingClasses) {
    if (t3 && subjectByName['English']) {
      newAssignments.push({ teacher_id: t3.id, class_id: cls.id, subject_id: subjectByName['English'].id });
    }
    if (t4 && subjectByName['Social Science']) {
      newAssignments.push({ teacher_id: t4.id, class_id: cls.id, subject_id: subjectByName['Social Science'].id });
    }
  }

  if (newAssignments.length > 0) {
    await knex('teacher_assignments').insert(newAssignments).onConflict(['teacher_id', 'class_id', 'subject_id']).ignore();
  }

  // ──────────────────────────────────────────────
  // 6. Add more students (8 per new class)
  // ──────────────────────────────────────────────
  const studentGroups = {
    'Class 9|A': [
      { name: 'Ishaan Verma', roll: '1' },
      { name: 'Kavya Nair', roll: '2' },
      { name: 'Liam Fernandes', roll: '3' },
      { name: 'Mira Gupta', roll: '4' },
      { name: 'Noah Kapoor', roll: '5' },
      { name: 'Olivia Saxena', roll: '6' },
      { name: 'Pranav Joshi', roll: '7' },
      { name: 'Qiana Roy', roll: '8' },
    ],
    'Class 9|B': [
      { name: 'Rahul Mehta', roll: '1' },
      { name: 'Sneha Patel', roll: '2' },
      { name: 'Tara Singh', roll: '3' },
      { name: 'Uday Rao', roll: '4' },
      { name: 'Vani Desai', roll: '5' },
      { name: 'Yash Agarwal', roll: '6' },
      { name: 'Zara Khan', roll: '7' },
      { name: 'Arjun Menon', roll: '8' },
    ],
    'Class 10|A': [
      { name: 'Aanya Sharma', roll: '1' },
      { name: 'Dhruv Bansal', roll: '2' },
      { name: 'Gauri Reddy', roll: '3' },
      { name: 'Harsh Choudhary', roll: '4' },
      { name: 'Ira Jain', roll: '5' },
      { name: 'Kabir Malhotra', roll: '6' },
      { name: 'Lavanya Pillai', roll: '7' },
      { name: 'Manav Sethi', roll: '8' },
    ],
    'Class 10|B': [
      { name: 'Neha Bhat', roll: '1' },
      { name: 'Om Tiwari', roll: '2' },
      { name: 'Priya Kulkarni', roll: '3' },
      { name: 'Rohan Srivastava', roll: '4' },
      { name: 'Sia Dutta', roll: '5' },
      { name: 'Tanay Ghosh', roll: '6' },
      { name: 'Urvi Chatterjee', roll: '7' },
      { name: 'Vihaan Basu', roll: '8' },
    ],
  };

  const addedStudents = [];

  for (const cls of allClasses) {
    const key = `${cls.name}|${cls.section}`;
    const group = studentGroups[key];
    if (!group) continue;

    // Check if students already exist for this class
    const existingCount = await knex('students').where({ class_id: cls.id }).count('id as cnt').first();
    if (existingCount && parseInt(existingCount.cnt, 10) > 0) continue;

    for (const s of group) {
      const studentEmail = `${s.name.toLowerCase().replace(/\s+/g, '.')}@school.com`;

      // Skip if user already exists
      if (userByEmail[studentEmail]) continue;

      const [user] = await knex('users')
        .insert({
          school_id: school.id,
          email: studentEmail,
          password_hash: hash,
          role: 'student',
        })
        .returning('*');

      userByEmail[studentEmail] = user;

      const [student] = await knex('students')
        .insert({
          user_id: user.id,
          class_id: cls.id,
          roll_number: s.roll,
          full_name: s.name,
          parent_name: `Parent of ${s.name}`,
          parent_phone: '555-1111',
          emergency_contact: '555-9999',
        })
        .returning('*');

      addedStudents.push(student);
    }
  }

  // Collect ALL students including existing ones
  const allStudents = await knex('students').whereIn(
    'class_id',
    allClasses.map((c) => c.id),
  );

  const studentsByClass = {};
  for (const s of allStudents) {
    if (!studentsByClass[s.class_id]) studentsByClass[s.class_id] = [];
    studentsByClass[s.class_id].push(s);
  }

  const teacher1User = userByEmail['teacher1@school.com'];
  const teacher2User = userByEmail['teacher2@school.com'];
  const teacher3User = userByEmail['teacher3@school.com'];
  const teacher4User = userByEmail['teacher4@school.com'];
  const adminUser = userByEmail['admin@school.com'];

  // ──────────────────────────────────────────────
  // 7. Extended attendance — last 30 days for all classes
  // ──────────────────────────────────────────────
  const today = new Date();
  const statusOptions = ['present', 'present', 'present', 'present', 'absent', 'late', 'present'];

  for (const cls of allClasses) {
    const students = studentsByClass[cls.id];
    if (!students) continue;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Skip weekends
      const dayOfWeek = d.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      for (let j = 0; j < students.length; j++) {
        const status = statusOptions[(i + j) % statusOptions.length];
        const markedBy =
          i % 3 === 0
            ? teacher1User?.id
            : i % 3 === 1
              ? teacher2User?.id
              : teacher3User?.id || teacher1User?.id;

        await knex('attendance')
          .insert({
            student_id: students[j].id,
            class_id: cls.id,
            date: dateStr,
            status,
            marked_by: markedBy,
          })
          .onConflict(['student_id', 'date'])
          .ignore();
      }
    }
  }

  // ──────────────────────────────────────────────
  // 8. More exams
  // ──────────────────────────────────────────────
  const existingExams = await knex('exams').where({ school_id: school.id });
  const existingExamNames = new Set(existingExams.map((e) => e.name));

  const newExams = [];

  if (!existingExamNames.has('Unit Test 2')) {
    newExams.push({ school_id: school.id, name: 'Unit Test 2', exam_date: '2025-09-15', is_published: true });
  }
  if (!existingExamNames.has('Mid Term')) {
    newExams.push({ school_id: school.id, name: 'Mid Term', exam_date: '2025-10-01', is_published: true });
  }
  if (!existingExamNames.has('Final Term')) {
    newExams.push({ school_id: school.id, name: 'Final Term', exam_date: '2025-12-10', is_published: false });
  }
  if (!existingExamNames.has('Pre-Board')) {
    newExams.push({ school_id: school.id, name: 'Pre-Board', exam_date: '2026-01-15', is_published: false });
  }
  if (!existingExamNames.has('Weekly Quiz 1')) {
    newExams.push({ school_id: school.id, name: 'Weekly Quiz 1', exam_date: '2025-07-10', is_published: true });
  }
  if (!existingExamNames.has('Weekly Quiz 2')) {
    newExams.push({ school_id: school.id, name: 'Weekly Quiz 2', exam_date: '2025-07-25', is_published: true });
  }

  let addedExams = [];
  if (newExams.length > 0) {
    addedExams = await knex('exams').insert(newExams).returning('*');
  }

  const allExams = [...existingExams, ...addedExams];

  // ──────────────────────────────────────────────
  // 9. Results for all exams across all subjects
  // ──────────────────────────────────────────────
  const existingResults = await knex('results');
  const existingResultKeys = new Set();
  for (const r of existingResults) {
    existingResultKeys.add(`${r.exam_id}|${r.student_id}|${r.subject_id}`);
  }

  const resultBatches = [];
  const subjectsPerClass = {};

  for (const cls of allClasses) {
    const assignments = await knex('teacher_assignments')
      .join('subjects', 'teacher_assignments.subject_id', 'subjects.id')
      .where({ class_id: cls.id })
      .select('subjects.id', 'subjects.name');

    subjectsPerClass[cls.id] = assignments;
  }

  for (const exam of allExams) {
    if (!exam.is_published) continue;

    for (const cls of allClasses) {
      const students = studentsByClass[cls.id];
      const subjects = subjectsPerClass[cls.id];
      if (!students || !subjects) continue;

      for (const student of students) {
        for (const subject of subjects) {
          const key = `${exam.id}|${student.id}|${subject.id}`;
          if (existingResultKeys.has(key)) continue;

          const base = 30 + (parseInt(student.roll_number, 10) * 7 + subject.id.charCodeAt(0)) % 60;
          const marks = Math.min(Math.max(base + (exam.name.includes('Quiz') ? 5 : 0), 20), 100);

          resultBatches.push({
            exam_id: exam.id,
            student_id: student.id,
            subject_id: subject.id,
            marks_obtained: marks,
            total_marks: 100,
          });
        }
      }
    }
  }

  if (resultBatches.length > 0) {
    // Insert in chunks to avoid huge single queries
    const chunkSize = 100;
    for (let i = 0; i < resultBatches.length; i += chunkSize) {
      await knex('results').insert(resultBatches.slice(i, i + chunkSize)).onConflict(['exam_id', 'student_id', 'subject_id']).ignore();
    }
  }

  // ──────────────────────────────────────────────
  // 10. More assignments
  // ──────────────────────────────────────────────
  const existingAssignments = await knex('assignments');
  const existingAssignmentKeys = new Set();
  for (const a of existingAssignments) {
    existingAssignmentKeys.add(`${a.teacher_id}|${a.class_id}|${a.title}`);
  }

  const newAssignmentsData = [
    {
      teacher: t1,
      className: 'Class 8',
      section: 'A',
      subject: 'Mathematics',
      title: 'Quadratic Equations Practice',
      desc: 'Solve problems 1-15 from Chapter 4. Show all steps.',
      due: '2025-08-25',
    },
    {
      teacher: t1,
      className: 'Class 8',
      section: 'B',
      subject: 'Mathematics',
      title: 'Statistics Worksheet',
      desc: 'Complete the data handling exercises on pages 45-48.',
      due: '2025-08-28',
    },
    {
      teacher: t3,
      className: 'Class 9',
      section: 'A',
      subject: 'English',
      title: 'Essay: My Role Model',
      desc: 'Write a 500-word essay on your role model.',
      due: '2025-09-05',
    },
    {
      teacher: t3,
      className: 'Class 9',
      section: 'B',
      subject: 'English',
      title: 'Grammar Exercise',
      desc: 'Complete tenses and voice exercises from workbook.',
      due: '2025-09-10',
    },
    {
      teacher: t4,
      className: 'Class 10',
      section: 'A',
      subject: 'Social Science',
      title: 'History Project: Indian Independence',
      desc: 'Research and prepare a 3-page report on the Indian independence movement.',
      due: '2025-09-15',
    },
    {
      teacher: t2,
      className: 'Class 10',
      section: 'B',
      subject: 'Science',
      title: 'Chemistry Lab Report',
      desc: 'Write a detailed report on the acid-base titration experiment.',
      due: '2025-09-12',
    },
    {
      teacher: t4,
      className: 'Class 9',
      section: 'A',
      subject: 'Computer Science',
      title: 'HTML Basics',
      desc: 'Create a simple webpage about your school using HTML.',
      due: '2025-09-20',
    },
    {
      teacher: t3,
      className: 'Class 8',
      section: 'A',
      subject: 'Hindi',
      title: 'Nibandh: Mera Priya Khel',
      desc: 'Write a 300-word essay on your favourite sport.',
      due: '2025-09-02',
    },
  ];

  for (const item of newAssignmentsData) {
    if (!item.teacher) continue;

    const cls = allClasses.find((c) => c.name === item.className && c.section === item.section);
    const subject = subjectByName[item.subject];
    if (!cls || !subject) continue;

    const key = `${item.teacher.id}|${cls.id}|${item.title}`;
    if (existingAssignmentKeys.has(key)) continue;

    await knex('assignments').insert({
      teacher_id: item.teacher.id,
      class_id: cls.id,
      subject_id: subject.id,
      title: item.title,
      description: item.desc,
      due_date: item.due,
    });
  }

  // ──────────────────────────────────────────────
  // 11. More announcements
  // ──────────────────────────────────────────────
  const existingAnnouncements = await knex('announcements');
  const existingAnnouncementKeys = new Set();
  for (const a of existingAnnouncements) {
    existingAnnouncementKeys.add(`${a.title}|${a.class_id || 'all'}`);
  }

  const newAnnouncements = [
    {
      title: 'PTM Schedule (Class 8)',
      body: 'Parent-Teacher meeting scheduled for Sep 5th, 2025 at 10:00 AM in the school auditorium.',
      classId: existingClasses.find((c) => c.name === 'Class 8' && c.section === 'A')?.id || null,
      createdBy: adminUser?.id,
    },
    {
      title: 'PTM Schedule (Class 9)',
      body: 'Parent-Teacher meeting scheduled for Sep 6th, 2025 at 10:00 AM in the school auditorium.',
      classId: allClasses.find((c) => c.name === 'Class 9' && c.section === 'A')?.id || null,
      createdBy: adminUser?.id,
    },
    {
      title: 'Science Fair Announcement',
      body: 'Annual Science Fair will be held on Oct 15th. All students are encouraged to participate.',
      classId: null,
      createdBy: adminUser?.id,
    },
    {
      title: 'Diwali Vacation Notice',
      body: 'School will remain closed from Oct 28th to Nov 4th for Diwali break.',
      classId: null,
      createdBy: adminUser?.id,
    },
    {
      title: 'Extra Math Class',
      body: 'Extra Math revision classes will be held every Saturday from 9 AM to 11 AM starting Sep 10th.',
      classId: existingClasses.find((c) => c.name === 'Class 8' && c.section === 'A')?.id || null,
      createdBy: teacher1User?.id,
    },
    {
      title: 'Homework Submission Reminder',
      body: 'Please ensure all pending assignments are submitted by Friday. Late submissions will not be accepted.',
      classId: allClasses.find((c) => c.name === 'Class 9' && c.section === 'B')?.id || null,
      createdBy: teacher3User?.id,
    },
    {
      title: 'Sports Day Registration',
      body: 'Annual Sports Day is on Nov 20th. Register for events by Oct 30th with your class teacher.',
      classId: null,
      createdBy: adminUser?.id,
    },
    {
      title: 'Model United Nations Conference',
      body: 'MUN conference will be held on Dec 5th. Interested students should register by Nov 15th.',
      classId: allClasses.find((c) => c.name === 'Class 10' && c.section === 'A')?.id || null,
      createdBy: teacher4User?.id,
    },
  ];

  for (const item of newAnnouncements) {
    const key = `${item.title}|${item.classId || 'all'}`;
    if (existingAnnouncementKeys.has(key)) continue;

    await knex('announcements').insert({
      school_id: school.id,
      created_by: item.createdBy,
      title: item.title,
      body: item.body,
      class_id: item.classId,
    });
  }

  // ──────────────────────────────────────────────
  // 12. Extended timetable for new classes
  // ──────────────────────────────────────────────
  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
  const periods = [
    { start: '08:00', end: '08:45' },
    { start: '08:50', end: '09:35' },
    { start: '09:40', end: '10:25' },
    { start: '10:40', end: '11:25' },
    { start: '11:30', end: '12:15' },
    { start: '13:00', end: '13:45' },
    { start: '13:50', end: '14:35' },
  ];

  const existingTimetable = await knex('timetable');
  const existingTimetableKeys = new Set();
  for (const t of existingTimetable) {
    existingTimetableKeys.add(`${t.class_id}|${t.day}|${t.start_time}`);
  }

  for (const cls of addedClasses) {
    const subjectCycle = [
      subjectByName['Mathematics'],
      subjectByName['Science'],
      subjectByName['English'],
      subjectByName['Social Science'],
      subjectByName['Hindi'],
      subjectByName['Computer Science'],
      subjectByName['Mathematics'],
    ].filter(Boolean);

    const teacherCycle = [
      teacherByEmail['teacher1@school.com'],
      teacherByEmail['teacher2@school.com'],
      teacherByEmail['teacher3@school.com'],
      teacherByEmail['teacher4@school.com'],
      teacherByEmail['teacher3@school.com'],
      teacherByEmail['teacher4@school.com'],
      teacherByEmail['teacher1@school.com'],
    ].filter(Boolean);

    for (const day of days) {
      for (let p = 0; p < 5; p++) {
        const subject = subjectCycle[p % subjectCycle.length];
        const teacher = teacherCycle[p % teacherCycle.length];
        if (!subject || !teacher) continue;

        const key = `${cls.id}|${day}|${periods[p].start}`;
        if (existingTimetableKeys.has(key)) continue;

        await knex('timetable').insert({
          class_id: cls.id,
          subject_id: subject.id,
          teacher_id: teacher.id,
          day,
          start_time: periods[p].start,
          end_time: periods[p].end,
        });
      }
    }
  }

  console.log('✅ Additional test data seeded successfully!');
  console.log(`   • ${addedSubjects.length} new subjects`);
  console.log(`   • ${addedClasses.length} new classes`);
  console.log(`   • ${addedStudents.length} new students across new classes`);
  console.log(`   • Attendance records for last 30 days across all classes`);
  console.log(`   • ${newExams.length} new exams`);
  console.log(`   • ${resultBatches.length} result entries`);
  console.log(`   • ${newAnnouncements.length} new announcements`);
  console.log(`   • Timetable for ${addedClasses.length} new classes`);
  console.log('');
  console.log('New teacher credentials:');
  console.log('   teacher3@school.com / password123  (Emily Brown - English, Hindi)');
  console.log('   teacher4@school.com / password123  (Michael Davis - Social Science, CS)');
};
