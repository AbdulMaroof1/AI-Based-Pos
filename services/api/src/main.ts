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

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port, config.host);
  console.log(`ABMNEXT ERP API running on http://${config.host}:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
