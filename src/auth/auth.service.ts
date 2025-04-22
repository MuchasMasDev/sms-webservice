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

  async signUp(dto: SignUpDto, joinDate?: string): Promise<User> {
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
        roles: [role],
        ref_code: this.generateRefCode({
          first_name: firstName,
          last_name: lastName,
          joinDate: joinDate || new Date().toISOString(),
        }),
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

  async updatePassword(_user: User, password: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.admin.updateUserById(_user.id, {
      password,
    });

    if (error) {
      throw new Error(
        `Error updating password for user with ID ${_user.id}: ${error.message}`,
      );
    }
  }

  private generateRefCode(refCodeInformation: {
    first_name: string;
    last_name: string;
    joinDate: string;
  }): string {
    const { first_name, last_name, joinDate } = refCodeInformation;

    // Get all name parts (first + last names)
    const nameParts = [
      ...first_name.split(' '),
      ...last_name.split(' '),
    ].filter((part) => part.length > 0);

    // Extract initials (max 4 letters, pad with '0' if fewer)
    const initials = nameParts
      .slice(0, 4)
      .map((part) => part[0].toUpperCase())
      .join('')
      .padEnd(4, '0');

    const dateObj = new Date(joinDate);
    const day = dateObj.getDate() + 1;
    const year = dateObj.getFullYear() % 100;

    const formattedDay = day.toString().padStart(3, '0');

    const randomDigit = Math.floor(Math.random() * 10);

    // Build the 10-char code
    return `${initials}${randomDigit}${formattedDay}${year.toString().padStart(2, '0')}`;
  }
}
