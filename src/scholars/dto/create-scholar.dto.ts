import { scholar_state } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateBankAccountDto } from 'src/financial/dto/create-bank-account.dto';
import { CreateAddressDto } from './create-address.dto';
import { CreatePhoneNumberDto } from './create-phone.dto';

export class CreateScholarDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsUUID()
  @IsOptional()
  userId: string;

  @IsString()
  @IsNotEmpty()
  dob: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsBoolean()
  @IsNotEmpty()
  hasDisability: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  disabilityDescription?: string;

  @IsInt()
  @IsNotEmpty()
  numberOfChildren: number;

  @IsString()
  @IsNotEmpty()
  ingressDate: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  emergencyContactName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  emergencyContactPhone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  emergencyContactRelationship: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  dui?: string;

  @IsEnum(scholar_state)
  @IsNotEmpty()
  state: scholar_state;

  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  @IsNotEmpty()
  @ArrayMinSize(1)
  addresses?: CreateAddressDto[];

  @ValidateNested({ each: true })
  @Type(() => CreatePhoneNumberDto)
  @IsNotEmpty()
  @ArrayMinSize(1)
  phoneNumbers?: CreatePhoneNumberDto[];

  @ValidateNested({ each: true })
  @Type(() => CreateBankAccountDto)
  @IsNotEmpty()
  @ArrayMinSize(1)
  bankAccounts?: CreateBankAccountDto[];
}
