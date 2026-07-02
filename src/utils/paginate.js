async function paginate(queryFn, options = {}, maxLimit = 200) {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 50;
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(Math.max(1, limit), maxLimit);
  const offset = (pageNum - 1) * limitNum;

  const context = {
    search: typeof options.search === 'string' ? options.search.trim() : null,
    searchFields: Array.isArray(options.searchFields) ? options.searchFields : [],
    filters: typeof options.filters === 'object' && options.filters !== null ? options.filters : {},
  };

  const { count } = await queryFn('count', context).count('* as count').first();
  const data = await queryFn('list', context).offset(offset).limit(limitNum);

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
