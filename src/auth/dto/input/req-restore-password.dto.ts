import { IsEmail, IsString } from 'class-validator';

export class RequestRestorePasswordDto {
  @IsString()
  @IsEmail()
  email: string;
}
