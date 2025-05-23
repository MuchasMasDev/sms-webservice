import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, public_users as User } from '@prisma/client';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { RolesUpdateDto, UserUpdateDto } from './dto';
import { SupabaseService } from 'src/configs/supabase/supabase.service';
import { PaginationResultDto, SearchQueryDto } from 'src/common/dtos';
import { buildPaginationOptions } from 'src/common/utils/build-pagination-options';

const publicUserFields = Object.values(Prisma.Public_usersScalarFieldEnum);

@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prismaService: PrismaService,
  ) {}

  async findAll(queryDto: SearchQueryDto): Promise<PaginationResultDto<User>> {
    const { skip, take, where, orderBy, pageIndex, pageSize } =
      buildPaginationOptions(
        queryDto,
        this.buildUserWhere,
        this.buildUserOrder,
      );

    const [users, totalCount] = await this.prismaService.$transaction([
      this.prismaService.public_users.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      this.prismaService.public_users.count({ where }),
    ]);

    return {
      data: users,
      total: totalCount,
      pageIndex,
      pageSize,
    };
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

  async findOneByEmail(email: string): Promise<User> {
    const user: User | null = await this.prismaService.public_users.findFirst({
      where: { email },
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

  async updateProfileImage(id: string, profile_img_src: string): Promise<User> {
    const user: User = await this.findOne(id);
    return this.prismaService.public_users.update({
      data: { profile_img_src },
      where: { id: user.id },
    });
  }

  // TODO: validate delete behavior
  async delete(id: string): Promise<User> {
    const supabase = this.supabaseService.getClient();
    const user: User = await this.findOne(id);
    await this.prismaService.public_users.delete({ where: { id: user.id } });
    await supabase.auth.admin.deleteUser(user.id);
    return user;
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

  private buildUserWhere = (query: string, status: string) => {
    const where: any = {};

    if (query) {
      where.OR = [
        {
          first_name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          last_name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          ref_code: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ];
    }

    // TODO: validate status or role filter
    // if (status !== 'all') {
    //   where.roles = status;
    // }

    return where;
  };

  private buildUserOrder = (key?: string, order: 'asc' | 'desc' = 'asc') => {
    if (!key) return undefined;

    if (publicUserFields.includes(key as any)) {
      return {
        [key]: order,
      };
    }

    throw new BadRequestException('Order key does not exists');
  };
}
