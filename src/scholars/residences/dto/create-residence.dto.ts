import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResidenceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsOptional()
  phoneId?: number;

  @IsInt()
  @IsNotEmpty()
  addressId: number;
}
