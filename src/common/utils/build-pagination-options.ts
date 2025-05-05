import { SearchQueryDto } from '../dtos';

export function buildPaginationOptions<T>(
  dto: SearchQueryDto,
  customWhereBuilder?: (query: string, status: string) => T,
  customOrderBuilder?: (key?: string, order?: 'asc' | 'desc') => any,
) {
  const { pageIndex = 1, pageSize = 10, query = '', status = 'all' } = dto;

  const skip = (pageIndex - 1) * pageSize;
  const take = pageSize;

  let where: any = {};

  if (customWhereBuilder) {
    where = customWhereBuilder(query, status);
  }

  const orderBy = customOrderBuilder
    ? customOrderBuilder(dto['sort[key]'], dto['sort[order]'])
    : dto['sort[key]']
      ? { [dto['sort[key]']]: dto['sort[order]'] || 'asc' }
      : undefined;

  return {
    skip,
    take,
    where,
    orderBy,
    pageIndex,
    pageSize,
  };
}
