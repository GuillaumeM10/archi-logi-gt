import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { AuthenticationService } from './authentication/authentication.service';
import { EmailModule } from './email/email.module';
import { AuthenticationGuard } from './guard/authentication.guard';
import { UserModule } from './user/user.module';
import { PasswordUtilsService } from './utils/password-utils.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number.parseInt(process.env.POSTGRES_PORT),
      password: process.env.POSTGRES_PASSWORD,
      username: process.env.POSTGRES_USER,
      autoLoadEntities: true,
      database: process.env.POSTGRES_DB,
      synchronize: true,
      logging: false,
    }),
    UserModule,
    AuthenticationModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PasswordUtilsService,
    AuthenticationService,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class AppModule {}
