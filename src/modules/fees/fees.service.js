const ApiError = require('../../utils/ApiError');
const repo = require('./fees.repository');

async function listStructures(schoolId, pagination) {
  return repo.findAllStructures(schoolId, pagination);
}

async function createStructure(data) {
  return repo.createStructure(data);
}

async function listPending(schoolId, pagination) {
  return repo.findPendingBySchool(schoolId, pagination);
}

async function recordPayment(data) {
  return repo.createPayment(data);
}

async function getByStudent(studentId) {
  const student = await repo.findStudentById(studentId);
  const classId = student ? student.class_id : null;

  const [structures, payments] = await Promise.all([
    classId ? repo.findStructuresByClass(classId) : [],
    repo.findPaymentsByStudent(studentId),
  ]);

  const paidStructureIds = new Set(
    payments
      .filter((p) => p.fee_structure_id && p.status === 'paid')
      .map((p) => p.fee_structure_id)
  );

  const paidDateMap = {};
  for (const p of payments) {
    if (p.fee_structure_id && p.status === 'paid' && !paidDateMap[p.fee_structure_id]) {
      paidDateMap[p.fee_structure_id] = p.payment_date;
    }
  }

  const mappedStructures = structures.map((s) => ({
    id: s.id,
    fee_type: s.fee_type,
    amount: parseFloat(s.amount),
    due_date: s.due_date || null,
    paid: paidStructureIds.has(s.id),
    paid_date: paidDateMap[s.id] || null,
  }));

  const mappedPayments = payments.map((p) => ({
    id: p.id,
    amount: parseFloat(p.amount_paid),
    payment_date: p.payment_date,
    payment_method: p.payment_mode || null,
    transaction_id: null,
  }));

  return { structures: mappedStructures, payments: mappedPayments };
}

module.exports = { listStructures, createStructure, listPending, recordPayment, getByStudent };
