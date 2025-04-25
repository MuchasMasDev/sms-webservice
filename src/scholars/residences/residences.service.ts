import { Injectable, NotFoundException } from '@nestjs/common';
import { residences as Residence } from '@prisma/client';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { CreateResidenceDto, UpdateResidenceDto } from './dto';

@Injectable()
export class ResidencesService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createDto: CreateResidenceDto): Promise<Residence> {
    return this.prismaService.residences.create({
      data: {
        name: createDto.name,
        phone: createDto.phoneId,
        address_id: createDto.addressId,
      },
    });
  }

  findAll(): Promise<Residence[]> {
    return this.prismaService.residences.findMany({});
  }

  async findOne(id: number): Promise<Residence> {
    const data: Residence | null =
      await this.prismaService.residences.findUnique({
        where: { id },
      });
    if (!data) {
      throw new NotFoundException('Requested residence was not found');
    }
    return data;
  }

  async update(id: number, updateDto: UpdateResidenceDto): Promise<Residence> {
    const data: Residence =
      await this.prismaService.residences.findUniqueOrThrow({
        where: { id },
      });

    return this.prismaService.residences.update({
      data: {
        ...this.mapResidenceDtoToPrisma(updateDto),
      },
      where: { id: data.id },
    });
  }

  async delete(id: number): Promise<Residence> {
    return await this.prismaService.residences.delete({ where: { id } });
  }

  private mapResidenceDtoToPrisma(
    updateDto: UpdateResidenceDto,
  ): Partial<Residence> {
    return {
      ...(updateDto.name !== undefined && {
        name: updateDto.name,
      }),
      ...(updateDto.phoneId !== undefined && {
        phone: updateDto.phoneId,
      }),
      ...(updateDto.addressId !== undefined && {
        address_id: updateDto.addressId,
      }),
    };
  }
}
