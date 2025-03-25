import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { SupabaseService } from './supabase/supabase.service';

@Global()
@Module({
  providers: [PrismaService, SupabaseService],
  exports: [PrismaService, SupabaseService],
})
export class ConfigsModule {}
