import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filter/restExceptionFIlter';
import { error } from 'console';

/**
 *
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
      exceptionFactory: (errors) => {
        console.error('Validation Errors:', errors);
        return new BadRequestException(errors);
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: localhost:${process.env.PORT ?? 3000}`);
}

bootstrap()
  .then(() => console.log('API started'))
  .catch(console.error);
