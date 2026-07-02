const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAllStructures(schoolId, pagination) {
  return paginate((mode) => {
    let q = db('fee_structures')
      .leftJoin('classes', 'fee_structures.class_id', 'classes.id')
      .where('fee_structures.school_id', schoolId);

    if (mode === 'list') {
      q = q.select('fee_structures.*', 'classes.name as class_name')
        .orderBy('fee_structures.fee_type');
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

async function findStructuresByClass(classId, schoolId) {
  return db('fee_structures')
    .where(function () {
      this.where('class_id', classId).orWhereNull('class_id');
    })
    .where('school_id', schoolId)
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

module.exports = { findAllStructures, findStructureById, createStructure, findPendingBySchool, createPayment, findByStudent, findStudentById, findStructuresByClass, findPaymentsByStudent };
