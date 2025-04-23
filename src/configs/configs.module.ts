import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SupabaseService } from './supabase/supabase.service';
import { StorageService } from './storage/storage.service';

@Global()
@Module({
  providers: [PrismaService, SupabaseService, StorageService],
  exports: [PrismaService, SupabaseService, StorageService],
})
export class ConfigsModule {}
