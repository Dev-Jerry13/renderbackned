const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAllStructures(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('fee_structures')
      .leftJoin('classes', 'fee_structures.class_id', 'classes.id')
      .leftJoin('fee_posts', 'fee_structures.fee_post_id', 'fee_posts.id')
      .where('fee_structures.school_id', schoolId);

    if (mode === 'list') {
      q = q.select(
        'fee_structures.*',
        'classes.name as class_name',
        'fee_posts.title as post_title'
      ).orderBy('fee_structures.fee_type');
    }
    return q;
  }, pagination);
}

async function findStructureById(id, schoolId) {
  return db('fee_structures').where({ id, school_id: schoolId }).first();
}

async function createStructure(data) {
  const [s] = await db('fee_structures').insert(data).returning('*');
  return s;
}

async function findPendingBySchool(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('fee_payments')
      .join('students', 'fee_payments.student_id', 'students.id')
      .leftJoin('fee_structures', 'fee_payments.fee_structure_id', 'fee_structures.id')
      .where('fee_payments.school_id', schoolId)
      .where('fee_payments.status', 'pending');

    if (mode === 'list') {
      q = q.select(
        'fee_payments.*',
        'students.full_name as student_name',
        'fee_structures.fee_type'
      ).orderBy('fee_payments.payment_date', 'desc');
    }
    return q;
  }, pagination);
}

async function createPayment(data) {
  const [p] = await db('fee_payments').insert(data).returning('*');
  return p;
}

async function findByStudent(studentId, schoolId) {
  return db('fee_payments')
    .select(
      'fee_payments.*',
      'fee_structures.fee_type'
    )
    .leftJoin('fee_structures', 'fee_payments.fee_structure_id', 'fee_structures.id')
    .join('students', 'fee_payments.student_id', 'students.id')
    .join('users', 'students.user_id', 'users.id')
    .where('fee_payments.student_id', studentId)
    .where('users.school_id', schoolId)
    .orderBy('fee_payments.payment_date', 'desc');
}

async function findStudentById(studentId, schoolId) {
  return db('students')
    .join('users', 'students.user_id', 'users.id')
    .select('students.id', 'students.class_id')
    .where('students.id', studentId)
    .where('users.school_id', schoolId)
    .first();
}

async function findUnpaidBySchool(schoolId, filters = {}) {
  const { classId, paymentFilter, search } = filters;

  const rows = await db('students')
    .join('users', 'students.user_id', 'users.id')
    .join('classes', 'students.class_id', 'classes.id')
    .join('fee_structures', function () {
      this.on('fee_structures.class_id', '=', 'classes.id')
        .orOnNull('fee_structures.class_id');
    })
    .leftJoin('fee_posts', 'fee_structures.fee_post_id', 'fee_posts.id')
    .where('users.school_id', schoolId)
    .modify(function (q) {
      if (classId) q.where('students.class_id', classId);
      if (search) {
        q.where(function () {
          this.where('students.full_name', 'iLike', `%${search}%`)
            .orWhere('students.parent_name', 'iLike', `%${search}%`)
            .orWhere('students.parent_phone', 'iLike', `%${search}%`)
            .orWhere('students.roll_number', 'iLike', `%${search}%`);
        });
      }
    })
    .select(
      'students.id as student_id',
      'students.full_name as student_name',
      'classes.name as class_name',
      'fee_structures.id as fee_structure_id',
      'fee_structures.fee_type',
      'fee_structures.amount as total_amount',
      'fee_posts.due_date'
    )
    .orderBy('students.full_name')
    .orderBy('fee_structures.fee_type');

  if (rows.length === 0) return [];

  const paidRows = await db('fee_payments')
    .select('fee_structure_id', 'student_id')
    .sum('amount_paid as total_paid')
    .where('status', 'paid')
    .groupBy('fee_structure_id', 'student_id');

  const paidMap = {};
  for (const r of paidRows) {
    const key = `${r.student_id}|${r.fee_structure_id}`;
    paidMap[key] = parseFloat(r.total_paid) || 0;
  }

  return rows
    .map((row) => {
      const key = `${row.student_id}|${row.fee_structure_id}`;
      const totalPaid = paidMap[key] || 0;
      const totalAmount = parseFloat(row.total_amount);
      const remaining = totalAmount - totalPaid;
      const paymentStatus = totalPaid === 0 ? 'none' : 'partial';

      return {
        student_id: row.student_id,
        student_name: row.student_name,
        class_name: row.class_name,
        fee_structure_id: row.fee_structure_id,
        fee_type: row.fee_type,
        total_amount: totalAmount,
        amount: remaining,
        payment_status: paymentStatus,
        due_date: row.due_date,
      };
    })
    .filter((item) => {
      if (item.amount <= 0) return false;
      if (paymentFilter === 'none' && item.payment_status !== 'none') return false;
      if (paymentFilter === 'partial' && item.payment_status !== 'partial') return false;
      return true;
    });
}

async function findStructuresByClass(classId, schoolId) {
  return db('fee_structures')
    .leftJoin('fee_posts', 'fee_structures.fee_post_id', 'fee_posts.id')
    .where(function () {
      this.where('class_id', classId).orWhereNull('class_id');
    })
    .where('fee_structures.school_id', schoolId)
    .select(
      'fee_structures.*',
      'fee_posts.title as post_title',
      'fee_posts.description as post_description',
      'fee_posts.due_date as post_due_date'
    )
    .orderBy('fee_structures.fee_type');
}

async function findPaymentsByStudent(studentId, schoolId) {
  return db('fee_payments')
    .leftJoin('fee_structures', 'fee_payments.fee_structure_id', 'fee_structures.id')
    .join('students', 'fee_payments.student_id', 'students.id')
    .join('users', 'students.user_id', 'users.id')
    .select(
      'fee_payments.*',
      'fee_structures.fee_type'
    )
    .where('fee_payments.student_id', studentId)
    .where('users.school_id', schoolId)
    .orderBy('fee_payments.payment_date', 'desc');
}

async function createPost(data) {
  const { structures, ...postData } = data;
  const [post] = await db('fee_posts').insert(postData).returning('*');
  return post;
}

async function createPostStructures(structures, postId, schoolId) {
  const rows = structures.map((s) => ({
    school_id: schoolId,
    fee_post_id: postId,
    fee_type: s.fee_type,
    amount: s.amount,
    class_id: s.class_id || null,
  }));
  return db('fee_structures').insert(rows).returning('*');
}

async function findPostsBySchool(schoolId) {
  return db('fee_posts')
    .where('school_id', schoolId)
    .orderBy('created_at', 'desc');
}

async function findPostById(id, schoolId) {
  return db('fee_posts')
    .where({ id, school_id: schoolId })
    .first();
}

async function findStructuresByPost(postId) {
  return db('fee_structures')
    .leftJoin('classes', 'fee_structures.class_id', 'classes.id')
    .where('fee_structures.fee_post_id', postId)
    .select('fee_structures.*', 'classes.name as class_name')
    .orderBy('fee_structures.fee_type');
}

module.exports = {
  findAllStructures, findStructureById, createStructure,
  findPendingBySchool, createPayment, findByStudent,
  findStudentById, findStructuresByClass, findPaymentsByStudent,
  createPost, createPostStructures, findPostsBySchool, findPostById, findStructuresByPost,
  findUnpaidBySchool,
};
