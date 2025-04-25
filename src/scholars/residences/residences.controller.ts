import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { ResidencesService } from './residences.service';
import { CreateResidenceDto, UpdateResidenceDto } from './dto';

@UseGuards(JwtGuard)
@Controller('residences')
export class ResidencesController {
  constructor(private readonly residencesService: ResidencesService) {}

  @Post()
  create(@Body() createDto: CreateResidenceDto) {
    return this.residencesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.residencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.residencesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateResidenceDto,
  ) {
    return this.residencesService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.residencesService.findOne(id);
    return await this.residencesService.delete(id);
  }
}
