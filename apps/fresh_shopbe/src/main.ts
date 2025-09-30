import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE', 'Fresh Shop API'))
    .setDescription(
      configService.get<string>(
        'SWAGGER_DESCRIPTION',
        'API documentation for Fresh Shop application',
      ),
    )
    .setVersion(configService.get<string>('SWAGGER_VERSION', '1.0'))
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  const port = +configService.getOrThrow<number>('PORT')!;
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();
