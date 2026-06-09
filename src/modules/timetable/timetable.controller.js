const timetableService = require('./timetable.service');

async function list(req, res, next) {
  try {
    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ error: 'classId query parameter is required' });
    }
    const entries = await timetableService.getByClass(classId);
    res.json(entries);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const entry = await timetableService.create(req.validated);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const entry = await timetableService.update(req.params.id, req.validated);
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await timetableService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
