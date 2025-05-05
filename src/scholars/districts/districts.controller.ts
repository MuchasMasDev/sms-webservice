import { Controller, Get, Query } from '@nestjs/common';
import { DistrictsService } from './districts.service';

@Controller('districts')
export class DistrictsController {
  constructor(private readonly districtsService: DistrictsService) {}

  @Get()
  findAll() {
    return this.districtsService.findAll();
  }

  @Get('/by-name')
  findOne(@Query('name') name: string) {
    return this.districtsService.findOneByName(name);
  }
}
