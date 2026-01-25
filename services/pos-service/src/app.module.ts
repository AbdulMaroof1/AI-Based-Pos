import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PosModule } from './pos/pos.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    PosModule,
  ],
})
export class AppModule {}

