import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { getConfig } from '@pos/config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = getConfig();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors();

  await app.listen(config.port, config.host);
  console.log(`Auth Service running on http://${config.host}:${config.port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Auth Service:', error);
  process.exit(1);
});

