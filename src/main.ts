import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

   app.enableCors({
    origin: true, 
    allowedHeaders: ['Content-Type', 'x-recaptcha-token', 'Authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

 app.useGlobalFilters(new HttpExceptionFilter());
 
 app.useGlobalPipes( new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
 }))


  console.log('ConfigServer', configService.get('PORT'));
const port = configService.get<number>('app.port') || 3000;

  await app.listen(port);
}
bootstrap();
