import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';
import { ImageFileInterceptor } from 'src/configs/interceptors/image-file.interceptor';
import { StorageService } from 'src/configs/storage/storage.service';
import { banks as Bank } from '@prisma/client';

@Controller('banks')
export class BanksController {
  constructor(
    private readonly storageService: StorageService,
    private readonly banksService: BanksService,
  ) {}

  @Post()
  @UseInterceptors(ImageFileInterceptor('file'))
  async create(
    @Body() createBankDto: CreateBankDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file must be provided');
    }

    const filePath = `banks/${Date.now()}-${file.originalname}`;
    const publicUrl = await this.storageService.uploadFile(
      filePath,
      file.buffer,
      file.mimetype,
    );

    createBankDto.logo_src = publicUrl;
    return this.banksService.create(createBankDto);
  }

  @Get()
  findAll() {
    return this.banksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.banksService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(ImageFileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBankDto: UpdateBankDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const bank: Bank = await this.banksService.findOne(id);

    if (file) {
      const filePath = `banks/${Date.now()}-${file.originalname}`;
      const publicUrl = await this.storageService.uploadFile(
        filePath,
        file.buffer,
        file.mimetype,
      );

      updateBankDto.logo_src = publicUrl;

      // Delete old resource
      await this.storageService.deleteFile(bank.logo_src);
    } else {
      delete updateBankDto.logo_src;
    }

    return this.banksService.update(id, updateBankDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const bank: Bank = await this.banksService.findOne(id);
    if (bank.logo_src) {
      await this.storageService.deleteFile(bank.logo_src);
    }
    return await this.banksService.remove(id);
  }
}
