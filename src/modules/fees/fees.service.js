const ApiError = require('../../utils/ApiError');
const repo = require('./fees.repository');
const db = require('../../config/db');

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

async function getByStudent(studentId, schoolId) {
  const student = await repo.findStudentById(studentId, schoolId);
  if (!student) throw new ApiError(404, 'Student not found');
  const classId = student.class_id;

  const [structures, payments] = await Promise.all([
    classId ? repo.findStructuresByClass(classId, schoolId) : [],
    repo.findPaymentsByStudent(studentId, schoolId),
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

  // Group structures by fee_post_id
  const postMap = {};
  const ungrouped = [];

  for (const s of structures) {
    const detail = {
      id: s.id,
      fee_type: s.fee_type,
      amount: parseFloat(s.amount),
      paid: paidStructureIds.has(s.id),
      paid_date: paidDateMap[s.id] || null,
    };

    if (s.fee_post_id) {
      if (!postMap[s.fee_post_id]) {
        postMap[s.fee_post_id] = {
          id: s.fee_post_id,
          title: s.post_title || 'Fee Post',
          description: s.post_description || null,
          due_date: s.post_due_date || null,
          structures: [],
        };
      }
      postMap[s.fee_post_id].structures.push(detail);
    } else {
      ungrouped.push(detail);
    }
  }

  const posts = Object.values(postMap);

  // Put ungrouped structures under "Other Fees" if any exist
  if (ungrouped.length > 0) {
    posts.push({
      id: null,
      title: 'Other Fees',
      description: null,
      due_date: null,
      structures: ungrouped,
    });
  }

  const mappedPayments = payments.map((p) => ({
    id: p.id,
    amount: parseFloat(p.amount_paid),
    payment_date: p.payment_date,
    payment_method: p.payment_mode || null,
    transaction_id: null,
  }));

  return { posts, payments: mappedPayments };
}

async function listUnpaid(schoolId) {
  return repo.findUnpaidBySchool(schoolId);
}

async function createPost(data, schoolId) {
  const { structures, ...postData } = data;

  // Use a transaction to create the post and all structures atomically
  const post = await db.transaction(async (trx) => {
    const [newPost] = await trx('fee_posts')
      .insert({ ...postData, school_id: schoolId })
      .returning('*');

    const structureRows = structures.map((s) => ({
      school_id: schoolId,
      fee_post_id: newPost.id,
      fee_type: s.fee_type,
      amount: s.amount,
      class_id: s.class_id || null,
    }));

    await trx('fee_structures').insert(structureRows).returning('*');
    return newPost;
  });

  return post;
}

async function listPosts(schoolId) {
  const posts = await repo.findPostsBySchool(schoolId);
  const result = [];
  for (const post of posts) {
    const structures = await repo.findStructuresByPost(post.id);
    result.push({
      ...post,
      amount: parseFloat(post.amount || 0),
      structures: structures.map((s) => ({
        ...s,
        amount: parseFloat(s.amount),
      })),
    });
  }
  return result;
}

async function getPost(id, schoolId) {
  const post = await repo.findPostById(id, schoolId);
  if (!post) throw new ApiError(404, 'Fee post not found');
  const structures = await repo.findStructuresByPost(post.id);
  return {
    ...post,
    structures: structures.map((s) => ({
      ...s,
      amount: parseFloat(s.amount),
    })),
  };
}

module.exports = { listStructures, createStructure, listPending, recordPayment, getByStudent, listUnpaid, createPost, listPosts, getPost };
