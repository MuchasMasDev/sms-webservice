import { OmitType } from '@nestjs/mapped-types';
import { CreateScholarDto } from './create-scholar.dto';

export class UpdateScholarDto extends OmitType(CreateScholarDto, [
  'password',
] as const) {}
