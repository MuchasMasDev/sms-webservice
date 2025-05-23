import { IsArray, IsEnum } from 'class-validator';
import { RoleEnum } from 'src/common/enums';

export class RolesUpdateDto {
  @IsArray()
  @IsEnum(RoleEnum, {
    each: true,
    message: 'Each role must be one of: SCHOLAR, FINANCE, SPC, TUTOR, or ADMIN',
  })
  roles: RoleEnum[];
}
