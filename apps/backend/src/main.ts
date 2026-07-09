import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties that are not part of the DTO
      transform: true, // Automatically transform incoming types (for example, string to number/date)
    }),
  );

  // Register the global exception handler
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS to allow requests from the frontend
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
