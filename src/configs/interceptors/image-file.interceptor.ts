import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function ImageFileInterceptor(fieldName: string) {
  const options: MulterOptions = {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req: Request, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(
          new BadRequestException('Only image files are allowed'),
          false,
        );
      }
      callback(null, true);
    },
  };

  return FileInterceptor(fieldName, options);
}
