import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthenticationService } from '../authentication/authentication.service';
import { EmailService } from '../email/email.service';
import { PasswordUtilsService } from '../utils/password-utils.service';
import { User } from './entities/user';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    PasswordUtilsService,
    AuthenticationService,
    EmailService,
  ],
  exports: [UserService],
})
export class UserModule {}
