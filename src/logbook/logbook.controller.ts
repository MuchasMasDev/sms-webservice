import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LogbookService } from './logbook.service';
import { JwtGuard } from 'src/auth/guard';
import { CreateLogBookDto } from './dto';
import { GetUser, Roles } from 'src/auth/decorator';
import { public_users as User } from '@prisma/client';
import { RoleEnum } from 'src/common/enums';

@Roles(RoleEnum.ADMIN)
@UseGuards(JwtGuard)
@Controller('logbook')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Get()
  findAll() {
    return this.logbookService.getLogBooks();
  }

  @Get('/scholar/:id')
  findAllByScholar(@Param('id') id: string) {
    return this.logbookService.getLogBooksByScholar(id);
  }

  @Post('/scholar/:id')
  signUp(
    @Param('id') id: string,
    @Body() dto: CreateLogBookDto,
    @GetUser() user: User,
  ) {
    return this.logbookService.createLogBook(id, dto, user);
  }

  @Delete(':id')
  deleteById(@Param('id', ParseIntPipe) id: number) {
    return this.logbookService.deleteLogBook(id);
  }
}
