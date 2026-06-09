const feeService = require('./fees.service');

async function listStructures(req, res, next) {
  try {
    const structures = await feeService.listStructures(req.user.schoolId);
    res.json(structures);
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
    const pending = await feeService.listPending(req.user.schoolId);
    res.json(pending);
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
    const records = await feeService.getByStudent(req.params.id);
    res.json(records);
  } catch (err) {
    next(err);
  }
}

module.exports = { listStructures, createStructure, listPending, recordPayment, getByStudent };
