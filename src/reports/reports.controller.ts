import { Controller, Post } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('users')
  async generateUsersReport() {
    return this.reportsService.createUsersReport();
  }

  @Post('scholars')
  async generateScholarsReport() {
    return this.reportsService.createScholarsReport();
  }
}
