import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { FileOptions } from '@supabase/storage-js';

@Injectable()
export class StorageService {
  private readonly BUCKET = 'app_media';

  constructor(private readonly supabaseService: SupabaseService) {}

  async uploadFile(
    path: string,
    file: Buffer,
    contentType: string,
    options: FileOptions = { upsert: true },
  ): Promise<string> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.storage
      .from(this.BUCKET)
      .upload(path, file, {
        contentType,
        ...options,
      });

    if (error) {
      throw new InternalServerErrorException(
        `File upload failed: ${error.message}`,
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(this.BUCKET).getPublicUrl(path);

    return publicUrl;
  }

  async deleteFile(publicUrl: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // Extraer el path relativo desde la URL pública
    const splitToken = `/storage/v1/object/public/${this.BUCKET}/`;
    const index = publicUrl.indexOf(splitToken);

    if (index === -1) {
      throw new BadRequestException('Invalid Supabase public URL');
    }

    const filePath = publicUrl.substring(index + splitToken.length);

    const { data, error } = await supabase.storage
      .from(this.BUCKET)
      .remove([decodeURI(filePath)]);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }

    if (!data || data.length === 0) {
      throw new NotFoundException('File not found or already deleted');
    }
  }
}
