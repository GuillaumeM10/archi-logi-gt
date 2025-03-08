import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '@nestjs-modules/ioredis';

import { EmailService } from '../email/email.service';
import { UserModule } from '../user/user.module';
import { PasswordUtilsService } from '../utils/password-utils.service';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../../.env',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    RedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    }),
    UserModule,
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, EmailService, PasswordUtilsService],
  exports: [],
})
export class AuthenticationModule {}
