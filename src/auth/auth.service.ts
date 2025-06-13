import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { public_users as User } from '@prisma/client';
import { MailTemplateService } from 'src/configs/mail/mail-template.service';
import { MailService } from 'src/configs/mail/mail.service';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { SupabaseService } from 'src/configs/supabase/supabase.service';
import { AuthResponseDto, SignInDto, SignUpDto } from './dto';
import { RoleEnum } from 'src/common/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private mailTemplateService: MailTemplateService,
  ) {}

  async signUp(dto: SignUpDto, dob: Date): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const { email, password, firstName, lastName, roles } = dto;

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

    const refCode = this.generateRefCode({
      first_name: firstName,
      last_name: lastName,
      dob,
    });

    const updated = await this.prismaService.public_users.update({
      data: {
        roles,
        ref_code: refCode,
      },
      where: {
        id: user?.id,
      },
    });

    if (!updated) {
      throw new Error('No public user was created!');
    }

    // TODO: Uncomment and implement email sending logic when ready
    // const html = this.mailTemplateService.createUserWelcomeTemplate({
    //   activationUrl: 'https://app.muchasmas.org/',
    //   mail: email,
    //   password: password,
    //   name: `${firstName} ${lastName}`,
    // });

    // const htmlScholar = this.mailTemplateService.createWelcomeTemplate({
    //   activationUrl: 'https://app.muchasmas.org/',
    //   mail: email,
    //   password: password,
    // });

    // const text = this.mailTemplateService.generateTextVersion(
    //   '¡Bienvenida al Sistema de Gestión de Becarias de Muchas Más!',
    //   `Hola, nos alegra tenerte aquí...`,
    //   'Ir a la plataforma',
    //   'https://app.muchasmas.org/',
    // );

    // const emailContent = roles.includes(RoleEnum.SCHOLAR) ? htmlScholar : html;

    // try {
    //   await this.mailService.sendHtmlMail(
    //     emailContent,
    //     'Muchas Más - Bienvenida',
    //     html,
    //     text,
    //   );
    // } catch (error) {
    //   console.error('Error sending email:', error);
    //   throw new InternalServerErrorException('Failed to send email');
    // }

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

  async rquestRestorePassword(email: string) {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new ForbiddenException(error.message);
    }
  }

  async delete(id: string) {
    const supabase = this.supabaseService.getClient();
    await supabase.auth.admin.deleteUser(id);
  }

  private generateRefCode(refCodeInformation: {
    first_name: string;
    last_name: string;
    dob: Date;
  }): string {
    const { first_name, last_name, dob } = refCodeInformation;

    // Get first letter of the first name (first word only)
    const firstNameInitial = first_name.split(' ')[0][0].toUpperCase();

    // Get first letter of the last name (first word only)
    const lastNameInitial = last_name.split(' ')[0][0].toUpperCase();

    // Combine initials
    const initials = `${firstNameInitial}${lastNameInitial}`;

    // Extract date components
    const day = dob.getDate().toString().padStart(2, '0');
    const month = (dob.getMonth() + 1).toString().padStart(2, '0');
    const year = (dob.getFullYear() % 100).toString().padStart(2, '0');

    // Format date as DDMMYY (day, month, 2-digit year)
    const formattedDate = `${day}${month}${year}`;

    // Build the 8-char code (2 letters + 6 digits)
    return `${initials}${formattedDate}`;
  }
}
