import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SupabaseService } from './supabase/supabase.service';
import { StorageService } from './storage/storage.service';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
  providers: [PrismaService, SupabaseService, StorageService],
  exports: [PrismaService, SupabaseService, StorageService],
  imports: [MailModule],
})
export class ConfigsModule {}
