import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { public_users as User } from '@prisma/client';
import { GetUser } from 'src/auth/decorator';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { ScholarsService } from './scholars.service';
import { JwtGuard } from 'src/auth/guard';
import { SearchQueryDto } from 'src/common/dtos';
import { UsersService } from 'src/users/users.service';

@Controller('scholars')
@UseGuards(JwtGuard)
export class ScholarsController {
  constructor(
    private readonly scholarsService: ScholarsService,
    private readonly userService: UsersService,
  ) {}

  @Post()
  async create(
    @Body() createScholarDto: CreateScholarDto,
    @GetUser() user: User,
  ) {
    return await this.scholarsService.create(createScholarDto, user);
  }

  @Get()
  findAll(@Query() queryDto: SearchQueryDto) {
    return this.scholarsService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scholarsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateScholarDto: UpdateScholarDto,
    @GetUser() user: User,
  ) {
    return this.scholarsService.update(id, updateScholarDto, user);
  }

  @Patch(':email/email')
  async updateByEmail(
    @Param('email') email: string,
    @Body() updateScholarDto: UpdateScholarDto,
    @GetUser() user: User,
  ) {
    const _user = await this.userService.findOneByEmail(email);
    const scholar = await this.scholarsService.findOneByUserId(_user.id);
    return this.scholarsService.update(
      scholar.id,
      updateScholarDto,
      user,
    );
  }

  @Delete()
  async removeAll() {
    return await this.scholarsService.deleteAllScholars();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.scholarsService.findOne(id);
    return await this.scholarsService.remove(id);
  }

  @Delete(':id/phone-number/:phoneId')
  async removePhoneNumber(
    @Param('id') id: string,
    @Param('phoneId', ParseIntPipe) phoneId: number,
  ) {
    await this.scholarsService.findOne(id);
    return await this.scholarsService.removePhoneNumber(id, phoneId);
  }
}
