export class PaginationResultDto<T> {
  data: T[];
  total: number;
  pageIndex: number;
  pageSize: number;

  constructor(partial: PaginationResultDto<T>) {
    Object.assign(this, partial);
  }
}
