import { bank_account_type } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  accountHolder: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsEnum(bank_account_type)
  @IsNotEmpty()
  accountType: bank_account_type;

  @IsInt()
  @IsNotEmpty()
  bankId: number;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = true;
}
