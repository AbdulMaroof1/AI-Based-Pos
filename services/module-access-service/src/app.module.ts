import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ModuleAccessModule } from './module-access/module-access.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    ModuleAccessModule,
  ],
})
export class AppModule {}

