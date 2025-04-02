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

  @IsString()
  @IsOptional()
  apartmentNumber?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsInt()
  @IsNotEmpty()
  municipalityId: number;

  @IsBoolean()
  @IsNotEmpty()
  isUrban: boolean;
}
