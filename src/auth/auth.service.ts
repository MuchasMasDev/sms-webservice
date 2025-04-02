import { Injectable } from '@nestjs/common';
import { AuthResponseDto, SignInDto, SignUpDto } from './dto';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { SupabaseService } from 'src/configs/supabase/supabase.service';
import { public_users as User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prismaService: PrismaService,
  ) {}

  async signUp(dto: SignUpDto): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const { email, password, firstName, lastName, role } = dto;

    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const updated = await this.prismaService.public_users.update({
      data: {
        role,
        ref_code: this.generateRefCode(),
      },
      where: {
        id: user?.id,
      },
    });

    if (!updated) {
      throw new Error('No public user was created!');
    }

    return updated;
  }

  async signIn(dto: SignInDto): Promise<AuthResponseDto> {
    const supabase = this.supabaseService.getClient();
    const { email, password } = dto;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = await this.prismaService.public_users.findUnique({
      where: { id: data.user.id },
    });
    if (!user) {
      throw new Error('Error');
    }

    return {
      user,
      session: {
        access_token: data.session.access_token,
        token_type: data.session.token_type,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
      },
    };
  }

  // TODO: generate ref code
  private generateRefCode(): string | null {
    return null;
  }
}
