const holidayService = require('./holidays.service');

async function list(req, res, next) {
  try {
    if (req.query.year && req.query.month) {
      const result = await holidayService.listByMonth(
        req.user.schoolId,
        parseInt(req.query.year, 10),
        parseInt(req.query.month, 10),
      );
      return res.json(result);
    }
    const { page, limit } = req.query;
    const result = await holidayService.list(req.user.schoolId, { page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const holiday = await holidayService.create({
      ...req.validated,
      school_id: req.user.schoolId,
    });
    res.status(201).json(holiday);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const holiday = await holidayService.getById(req.params.id, req.user.schoolId);
    res.json(holiday);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const holiday = await holidayService.update(req.params.id, req.validated, req.user.schoolId);
    res.json(holiday);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await holidayService.remove(req.params.id, req.user.schoolId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, getById, update, remove };
