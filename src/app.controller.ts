import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './configs/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test')
  getTest(): { data: string } {
    return { data: 'This is a test!' };
  }

  @Get('prisma-test')
  async getPrismaTest(): Promise<{ data: object; message: string }> {
    const response = await this.prismaService.banks.findMany();
    return {
      data: response,
      message: 'This is a prisma test!',
    };
  }
}
