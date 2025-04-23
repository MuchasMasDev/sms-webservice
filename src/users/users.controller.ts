import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guard';
import { UpdateRolesDto } from './dto';

// TODO: add role guard
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/roles')
  async update(@Param('id') id: string, @Body() updateDto: UpdateRolesDto) {
    return this.usersService.updateRoles(id, updateDto);
  }
}
