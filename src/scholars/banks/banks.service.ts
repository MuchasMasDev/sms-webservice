import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { banks as Bank } from '@prisma/client';

@Injectable()
export class BanksService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createBankDto: CreateBankDto): Promise<Bank> {
    return this.prismaService.banks.create({ data: { ...createBankDto } });
  }

  findAll(): Promise<Bank[]> {
    return this.prismaService.banks.findMany({});
  }

  async findOne(id: number): Promise<Bank> {
    const bank: Bank | null = await this.prismaService.banks.findUnique({
      where: { id },
    });
    if (!bank) {
      throw new NotFoundException('Requested bank was not found');
    }
    return bank;
  }

  async update(id: number, updateBankDto: UpdateBankDto): Promise<Bank> {
    const bank: Bank = await this.prismaService.banks.findUniqueOrThrow({
      where: { id },
    });

    return this.prismaService.banks.update({
      data: { ...updateBankDto },
      where: { id: bank.id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.prismaService.banks.delete({ where: { id } });
  }
}
