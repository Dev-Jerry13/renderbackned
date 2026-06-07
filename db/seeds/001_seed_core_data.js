const bcrypt = require('bcryptjs');

exports.seed = async (knex) => {
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

  for (const s of studentData) {
    const [user] = await knex('users').insert({
      school_id: school.id,
      email: s.email,
      password_hash: hash,
      role: 'student',
    }).returning('*');

    await knex('students').insert({
      user_id: user.id,
      class_id: s.classId,
      roll_number: s.roll,
      full_name: s.fullName,
      parent_name: `Parent of ${s.fullName}`,
      parent_phone: '555-0000',
      emergency_contact: '555-9999',
    });
  }
};
