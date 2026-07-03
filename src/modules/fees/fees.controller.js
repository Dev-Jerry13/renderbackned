const feeService = require('./fees.service');

async function listStructures(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await feeService.listStructures(req.user.schoolId, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createStructure(req, res, next) {
  try {
    const structure = await feeService.createStructure({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(structure);
  } catch (err) {
    next(err);
  }
}

async function listPending(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await feeService.listPending(req.user.schoolId, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const payment = await feeService.recordPayment({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

async function getByStudent(req, res, next) {
  try {
    const records = await feeService.getByStudent(req.params.id, req.user.schoolId);
    res.json(records);
  } catch (err) {
    next(err);
  }
}

async function listUnpaid(req, res, next) {
  try {
    const result = await feeService.listUnpaid(req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createPost(req, res, next) {
  try {
    const post = await feeService.createPost(req.validated, req.user.schoolId);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

async function listPosts(req, res, next) {
  try {
    const posts = await feeService.listPosts(req.user.schoolId);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

async function getPost(req, res, next) {
  try {
    const post = await feeService.getPost(req.params.id, req.user.schoolId);
    res.json(post);
  } catch (err) {
    next(err);
  }
}

module.exports = { listStructures, createStructure, listPending, recordPayment, getByStudent, listUnpaid, createPost, listPosts, getPost };
