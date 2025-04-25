import { PartialType } from '@nestjs/mapped-types';
import { CreateResidenceDto } from './create-residence.dto';

export class UpdateResidenceDto extends PartialType(CreateResidenceDto) {}
