import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma/prisma.service';

@Injectable()
export class DistrictsService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.districts.findMany({});
  }

  findOneByName(name: string) {
    return this.prismaService.districts.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });
  }
}
