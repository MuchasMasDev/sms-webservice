import { PartialType } from '@nestjs/mapped-types';
import { CreateScholarDto } from './create-scholar.dto';

export class PartialUpdateScholarDto extends PartialType(CreateScholarDto) {}
