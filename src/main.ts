import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Настройка CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://adminkafuzics.netlify.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Валидация
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true, // Временно отключите для теста
    transform: true,
    disableErrorMessages: false, // Для отладки
  }));

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('API for products and categories management')
    .setVersion('1.0')
    .addTag('Categories')
    .addTag('Products')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();