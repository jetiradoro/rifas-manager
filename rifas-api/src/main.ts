import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DateFormatInterceptor } from './common/interceptors/date-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new DateFormatInterceptor());
  const port = process.env.PORT ?? 3000;
  console.log('---------------------------');
  console.log(
    `Aplicación ${process.env.API_NAME} escuchando en el puerto:`,
    port,
  );
  console.log('---------------------------');
  await app.listen(port);
}
bootstrap();
