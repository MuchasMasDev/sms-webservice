import { Injectable } from '@nestjs/common';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { PrismaService } from 'src/configs/prisma/prisma.service';

@Injectable()
export class BanksService {
  constructor(private readonly prismaService: PrismaService) {}

  create(createBankDto: CreateBankDto) {
    console.log(createBankDto);
    return 'This action adds a new bank';
  }

  findAll() {
    return this.prismaService.banks.findMany({});
  }

  findOne(id: number) {
    return `This action returns a #${id} bank`;
  }

  update(id: number, updateBankDto: UpdateBankDto) {
    console.log(updateBankDto);
    return `This action updates a #${id} bank`;
  }

  remove(id: number) {
    return `This action removes a #${id} bank`;
  }
}
