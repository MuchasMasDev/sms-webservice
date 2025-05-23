import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guard';
import { RolesUpdateDto, UserUpdateDto } from './dto';
import { SearchQueryDto } from 'src/common/dtos';
import { ImageFileInterceptor } from 'src/configs/interceptors/image-file.interceptor';
import { StorageService } from 'src/configs/storage/storage.service';
import { public_users as User } from '@prisma/client';

// TODO: add role guard
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly storageService: StorageService,
    private readonly usersService: UsersService,
  ) {}

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

  @Patch(':id/profile-image')
  @UseInterceptors(ImageFileInterceptor('file'))
  async updateProfileImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file must be provided');
    }

    const _user: User = await this.usersService.findOne(id);

    const filePath = `users/${_user.id}/${Date.now()}-${file.originalname}`;
    const publicUrl = await this.storageService.uploadFile(
      filePath,
      file.buffer,
      file.mimetype,
    );

    const updatedUser: User = await this.usersService.updateProfileImage(
      id,
      publicUrl,
    );
    if (_user.profile_img_src) {
      await this.storageService.deleteFile(_user.profile_img_src);
    }
    return updatedUser;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const user: User = await this.usersService.delete(id);
    if (user.profile_img_src) {
      await this.storageService.deleteFile(user.profile_img_src);
    }
    return { message: 'Usuario eliminado' };
  }
}
