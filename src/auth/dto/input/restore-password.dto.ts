import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RestorePasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(6)
  password: string;
}
