import { public_users as User } from '@prisma/client';
import { SessionDto } from './session.dto';

export class AuthResponseDto {
  user: User;
  session: SessionDto;
}
