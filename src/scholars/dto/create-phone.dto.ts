import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreatePhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsBoolean()
  @IsNotEmpty()
  isCurrent: boolean;
}
