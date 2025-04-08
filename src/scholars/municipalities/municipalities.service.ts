import { Injectable } from '@nestjs/common';
import { CreateMunicipalityDto } from './dto/create-municipality.dto';
import { UpdateMunicipalityDto } from './dto/update-municipality.dto';
import { PrismaService } from 'src/configs/prisma/prisma.service';

@Injectable()
export class MunicipalitiesService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createMunicipalityDto: CreateMunicipalityDto) {
    console.log(createMunicipalityDto);
    return 'This action adds a new municipality';
  }

  findAll() {
    return this.prismaService.municipalities.findMany({
      include: {
        departments: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} municipality`;
  }

  update(id: number, updateMunicipalityDto: UpdateMunicipalityDto) {
    console.log(updateMunicipalityDto);
    return `This action updates a #${id} municipality`;
  }

  remove(id: number) {
    return `This action removes a #${id} municipality`;
  }
}
