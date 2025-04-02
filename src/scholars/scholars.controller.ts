import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { public_users as User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { ScholarsService } from './scholars.service';
import { JwtGuard } from 'src/auth/guard';

@Controller('scholars')
@UseGuards(JwtGuard)
export class ScholarsController {
  constructor(private readonly scholarsService: ScholarsService) {}

  @Post()
  async create(
    @Body() createScholarDto: CreateScholarDto,
    @GetUser() user: User,
  ) {
    return await this.scholarsService.create(createScholarDto, user);
  }

  @Get()
  findAll() {
    return this.scholarsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scholarsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScholarDto: UpdateScholarDto) {
    return this.scholarsService.update(+id, updateScholarDto);
  }
}
