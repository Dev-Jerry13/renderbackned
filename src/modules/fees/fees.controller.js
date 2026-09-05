const feeService = require('./fees.service');

async function listStructures(req, res) {
  const { page, limit } = req.query;
  const result = await feeService.listStructures(req.user.schoolId, { page, limit });
  res.json(result);
}

async function createStructure(req, res) {
  const structure = await feeService.createStructure({
    ...req.validated,
    school_id: req.user.schoolId,
  });
  res.status(201).json(structure);
}

async function listPending(req, res) {
  const { page, limit } = req.query;
  const result = await feeService.listPending(req.user.schoolId, { page, limit });
  res.json(result);
}

async function recordPayment(req, res) {
  const payment = await feeService.recordPayment({
    ...req.validated,
    school_id: req.user.schoolId,
  });
  res.status(201).json(payment);
}

async function getByStudent(req, res) {
  const records = await feeService.getByStudent(req.params.id, req.user.schoolId);
  res.json(records);
}

async function listUnpaid(req, res) {
  const filters = {};
  if (req.query.class_id) filters.classId = req.query.class_id;
  if (req.query.payment_filter) filters.paymentFilter = req.query.payment_filter;
  if (req.query.search) filters.search = req.query.search;
  const result = await feeService.listUnpaid(req.user.schoolId, filters);
  res.json(result);
}

async function createPost(req, res) {
  const post = await feeService.createPost(req.validated, req.user.schoolId);
  res.status(201).json(post);
}

async function listPosts(req, res) {
  const posts = await feeService.listPosts(req.user.schoolId);
  res.json(posts);
}

async function getPost(req, res) {
  const post = await feeService.getPost(req.params.id, req.user.schoolId);
  res.json(post);
}

module.exports = { listStructures, createStructure, listPending, recordPayment, getByStudent, listUnpaid, createPost, listPosts, getPost };
