import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsArray,
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

  @IsArray()
  @IsEnum(RoleEnum, {
    each: true,
    message: 'Each role must be one of: SCHOLAR, FINANCE, SPC, TUTOR, or ADMIN',
  })
  roles: RoleEnum[];
}
