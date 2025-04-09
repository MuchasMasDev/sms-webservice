import { SearchQueryDto } from '../dtos';

export function buildPaginationOptions<T>(
  dto: SearchQueryDto,
  customWhereBuilder?: (query: string, status: string) => T,
) {
  const {
    pageIndex = 1,
    pageSize = 10,
    query = '',
    sortKey,
    sortOrder,
    status = 'all',
  } = dto;

  const skip = (pageIndex - 1) * pageSize;
  const take = pageSize;

  let where: any = {};

  if (customWhereBuilder) {
    where = customWhereBuilder(query, status);
  }

  const orderBy = sortKey ? { [sortKey]: sortOrder || 'asc' } : undefined;

  return {
    skip,
    take,
    where,
    orderBy,
    pageIndex,
    pageSize,
  };
}
