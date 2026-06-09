const db = require('../../config/db');

async function findAllStructures(schoolId) {
  return db('fee_structures')
    .select('fee_structures.*', 'classes.name as class_name')
    .leftJoin('classes', 'fee_structures.class_id', 'classes.id')
    .where('fee_structures.school_id', schoolId)
    .orderBy('fee_structures.fee_type');
}

async function findStructureById(id) {
  return db('fee_structures').where({ id }).first();
}

async function createStructure(data) {
  const [s] = await db('fee_structures').insert(data).returning('*');
  return s;
}

async function findPendingBySchool(schoolId) {
  return db('fee_payments')
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

module.exports = { findAllStructures, findStructureById, createStructure, findPendingBySchool, createPayment, findByStudent };
