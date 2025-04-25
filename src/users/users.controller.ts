import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guard';
import { RolesUpdateDto, UserUpdateDto } from './dto';
import { SearchQueryDto } from 'src/common/dtos';

// TODO: add role guard
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() queryDto: SearchQueryDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateDto: UserUpdateDto) {
    return this.usersService.updateUser(id, updateDto);
  }

  @Patch(':id/roles')
  async updateRoles(
    @Param('id') id: string,
    @Body() updateDto: RolesUpdateDto,
  ) {
    return this.usersService.updateRoles(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'Usuario eliminado' };
  }
}
