import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma/prisma.service';
import { CreateLogBookDto } from './dto';
import { public_users as User } from '@prisma/client';

@Injectable()
export class LogbookService {
  constructor(private readonly prismaService: PrismaService) {}

  getLogBooks() {
    return this.prismaService.scholars_logbook.findMany({
      include: { users: true },
    });
  }

  getLogBooksByScholar(scholarId: string) {
    return this.prismaService.scholars_logbook.findMany({
      where: { scholar_id: scholarId },
      include: { users: true },
    });
  }

  async createLogBook(
    scholarId: string,
    dto: CreateLogBookDto,
    creator: User | null,
  ) {
    const scholar = await this.prismaService.scholars.findUnique({
      where: { id: scholarId },
    });
    if (!scholar) throw new NotFoundException('Scholar not found');

    return await this.prismaService.scholars_logbook.create({
      data: {
        scholar_id: scholar.id,
        date: dto.date,
        log: dto.log,
        created_at: new Date(),
        created_by: creator?.id || null,
      },
    });
  }

  deleteLogBook(id: number) {
    return this.prismaService.scholars_logbook.delete({ where: { id } });
  }
}
