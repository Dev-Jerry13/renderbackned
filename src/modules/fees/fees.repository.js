const db = require('../../config/db');
const paginate = require('../../utils/paginate');

async function findAllStructures(schoolId, pagination) {
  const query = db('fee_structures')
    .select('fee_structures.*', 'classes.name as class_name')
    .leftJoin('classes', 'fee_structures.class_id', 'classes.id')
    .where('fee_structures.school_id', schoolId)
    .orderBy('fee_structures.fee_type');
  return paginate(query, pagination);
}

async function findStructureById(id) {
  return db('fee_structures').where({ id }).first();
}

async function createStructure(data) {
  const [s] = await db('fee_structures').insert(data).returning('*');
  return s;
}

async function findPendingBySchool(schoolId, pagination) {
  const query = db('fee_payments')
    .select(
      'fee_payments.*',
      'students.full_name as student_name',
      'fee_structures.fee_type'
    )
    .join('students', 'fee_payments.student_id', 'students.id')
    .leftJoin('fee_structures', 'fee_payments.fee_structure_id', 'fee_structures.id')
    .where('fee_payments.school_id', schoolId)
    .where('fee_payments.status', 'pending')
    .orderBy('fee_payments.payment_date', 'desc');
  return paginate(query, pagination);
}

async function createPayment(data) {
  const [p] = await db('fee_payments').insert(data).returning('*');
  return p;
}

async function findByStudent(studentId) {
  return db('fee_payments')
    .select(
      'fee_payments.*',
      'fee_structures.fee_type'
    )
    .leftJoin('fee_structures', 'fee_payments.fee_structure_id', 'fee_structures.id')
    .where('fee_payments.student_id', studentId)
    .orderBy('fee_payments.payment_date', 'desc');
}

async function findStudentById(studentId) {
  return db('students').select('id', 'class_id').where('id', studentId).first();
}

async function findStructuresByClass(classId) {
  return db('fee_structures')
    .where(function () {
      this.where('class_id', classId).orWhereNull('class_id');
    })
    .orderBy('fee_structures.fee_type');
}

async function findPaymentsByStudent(studentId) {
  return db('fee_payments')
    .leftJoin('fee_structures', 'fee_payments.fee_structure_id', 'fee_structures.id')
    .select(
      'fee_payments.*',
      'fee_structures.fee_type'
    )
    .where('fee_payments.student_id', studentId)
    .orderBy('fee_payments.payment_date', 'desc');
}

module.exports = { findAllStructures, findStructureById, createStructure, findPendingBySchool, createPayment, findByStudent, findStudentById, findStructuresByClass, findPaymentsByStudent };
