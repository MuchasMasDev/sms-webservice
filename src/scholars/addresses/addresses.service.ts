import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { addresses as Address, public_users as User } from '@prisma/client';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createAddressDto: CreateAddressDto, user: User): Promise<Address> {
    return this.prismaService.addresses.create({
      data: {
        street_line_1: createAddressDto.streetLine1,
        street_line_2: createAddressDto.streetLine2,
        district_id: createAddressDto.districtId,
        is_urban: createAddressDto.isUrban,
        created_by: user.id,
        created_at: new Date(),
      },
    });
  }

  findAll(): Promise<Address[]> {
    return this.prismaService.addresses.findMany({});
  }

  async findOne(id: number): Promise<Address> {
    const address: Address | null =
      await this.prismaService.addresses.findUnique({
        where: { id },
      });
    if (!address) {
      throw new NotFoundException('Requested adrress was not found');
    }
    return address;
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address: Address =
      await this.prismaService.addresses.findUniqueOrThrow({
        where: { id },
      });

    return this.prismaService.addresses.update({
      data: {
        ...this.mapAddressDtoToPrisma(updateAddressDto),
      },
      where: { id: address.id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prismaService.addresses.delete({ where: { id } });
  }

  private mapAddressDtoToPrisma(updateDto: UpdateAddressDto): Partial<Address> {
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
