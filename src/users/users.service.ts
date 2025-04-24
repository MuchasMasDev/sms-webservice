import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { public_users as User } from '@prisma/client';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { RolesUpdateDto, UserUpdateDto } from './dto';
import { SupabaseService } from 'src/configs/supabase/supabase.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prismaService: PrismaService,
  ) {}

  findAll(): Promise<User[]> {
    return this.prismaService.public_users.findMany({});
  }

  async findOne(id: string): Promise<User> {
    const user: User | null = await this.prismaService.public_users.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Requested user was not found');
    }
    return user;
  }

  async updateUser(id: string, dto: UserUpdateDto): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const user: User = await this.findOne(id);

    if (dto.email && user.email !== dto.email) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        email: dto.email,
      });

      if (error) {
        console.log(error);
        throw new BadRequestException('El correo electronico ya esta en uso');
      }
    }

    return this.prismaService.public_users.update({
      data: { ...this.mapUserDtoToPrisma(dto) },
      where: { id: user.id },
    });
  }

  async updateRoles(id: string, dto: RolesUpdateDto): Promise<User> {
    const user: User = await this.findOne(id);
    return this.prismaService.public_users.update({
      data: { roles: dto.roles },
      where: { id: user.id },
    });
  }

  // TODO: validate delete behavior
  async delete(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const user: User = await this.findOne(id);
    await this.prismaService.public_users.delete({ where: { id: user.id } });
    await supabase.auth.admin.deleteUser(user.id);
  }

  private mapUserDtoToPrisma(updateDto: UserUpdateDto): Partial<User> {
    return {
      ...(updateDto.firstName !== undefined && {
        first_name: updateDto.firstName,
      }),
      ...(updateDto.lastName !== undefined && {
        last_name: updateDto.lastName,
      }),
      ...(updateDto.email !== undefined && {
        email: updateDto.email,
      }),
    };
  }
}
