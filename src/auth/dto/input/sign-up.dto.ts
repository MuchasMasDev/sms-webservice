import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
} from 'class-validator';
import { RoleEnum } from 'src/common/enums';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(RoleEnum, {
    message: 'role must be either SCHOLAR, FINANCE, SPC, TUTOR, or ADMIN',
  })
  role: RoleEnum;
}
