import { IsOptional, IsInt, IsString, IsIn, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  'sort[key]'?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  @Transform(({ value }) => value?.order || 'asc')
  'sort[order]'?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsString()
  status?: string;
}
