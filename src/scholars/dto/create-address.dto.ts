import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
} from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  streetLine1: string;

  @IsString()
  @IsOptional()
  streetLine2?: string;

  @IsInt()
  @IsNotEmpty()
  districtId: number;

  @IsBoolean()
  @IsNotEmpty()
  isUrban: boolean;
}
