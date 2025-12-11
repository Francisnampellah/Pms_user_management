import { PaginationParams } from '../types';

const DEFAULT_PAGE_SIZE = parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10);
const MAX_PAGE_SIZE = parseInt(process.env.MAX_PAGE_SIZE || '100', 10);

export const getPaginationParams = (
  page?: number,
  limit?: number
): PaginationParams => {
  const pageNum = page && page > 0 ? page : 1;
  const limitNum = limit && limit > 0 ? Math.min(limit, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
