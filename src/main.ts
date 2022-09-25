import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as express from 'express';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const PORT = 5000;
  const logger = morgan('dev');

  
  app.use(logger);
  //app.useStaticAssets(join(__dirname, '..', 'file'));
  app.use('/files', express.static(join(__dirname, '../files')));

  await app.listen(PORT);

  console.log(`Application is running on: 🎁 http://localhost:${PORT}`);
}
bootstrap();
