import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { scholar_addresses as ScholarAddress } from '@prisma/client';
import { UpdateAddressDto } from './dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(): Promise<ScholarAddress[]> {
    return this.prismaService.scholar_addresses.findMany({});
  }

  async findOne(id: number): Promise<ScholarAddress> {
    const address: ScholarAddress | null =
      await this.prismaService.scholar_addresses.findUnique({
        where: { id },
      });
    if (!address) {
      throw new NotFoundException('Requested address was not found');
    }
    return address;
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<ScholarAddress> {
    const address: ScholarAddress =
      await this.prismaService.scholar_addresses.findUniqueOrThrow({
        where: { id },
      });

    return this.prismaService.scholar_addresses.update({
      data: {
        ...this.mapAddressDtoToPrisma(updateAddressDto),
      },
      where: { id: address.id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prismaService.scholar_addresses.delete({ where: { id } });
  }

  private mapAddressDtoToPrisma(
    updateDto: UpdateAddressDto,
  ): Partial<ScholarAddress> {
    return {
      ...(updateDto.streetLine1 !== undefined && {
        street_line_1: updateDto.streetLine1,
      }),
      ...(updateDto.streetLine2 !== undefined && {
        street_line_2: updateDto.streetLine2,
      }),
      ...(updateDto.districtId !== undefined && {
        district_id: updateDto.districtId,
      }),
      ...(updateDto.isUrban !== undefined && { is_urban: updateDto.isUrban }),
    };
  }
}
