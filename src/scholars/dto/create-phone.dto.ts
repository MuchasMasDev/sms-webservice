import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreatePhoneNumberDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsBoolean()
  @IsNotEmpty()
  isCurrent: boolean;
}
