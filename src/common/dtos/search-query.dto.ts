import { IsOptional, IsInt, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageIndex?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  sortKey?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  status?: string;
}
