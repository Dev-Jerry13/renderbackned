module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  req.validatedQuery = result.data;
  next();
};
