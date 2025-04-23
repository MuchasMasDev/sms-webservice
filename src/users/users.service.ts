import { Injectable, NotFoundException } from '@nestjs/common';
import { public_users as User } from '@prisma/client';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { UpdateRolesDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

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

  updateRoles(id: string, dto: UpdateRolesDto) {
    return this.prismaService.public_users.update({
      data: { roles: dto.roles },
      where: { id },
    });
  }
}
