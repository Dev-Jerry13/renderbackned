async function paginate(queryFn, { page = 1, limit = 50 }, maxLimit = 200) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 50), maxLimit);
  const offset = (pageNum - 1) * limitNum;

  const { count } = await queryFn('count').count('* as count').first();
  const data = await queryFn('list').offset(offset).limit(limitNum);

  const total = parseInt(count, 10);

  return {
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

module.exports = paginate;
