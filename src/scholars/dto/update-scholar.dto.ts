import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateScholarDto } from './create-scholar.dto';
import { Optional } from '@nestjs/common';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateBankAccountDto } from 'src/financial/dto/update-bank-account.dto';

export class UpdateScholarDto extends PartialType(
  OmitType(CreateScholarDto, ['bankAccount'] as const),
) {
  @Optional()
  @ValidateNested()
  @Type(() => UpdateBankAccountDto)
  bankAccount?: UpdateBankAccountDto;
}
