import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import {
  EmailDto,
  Login2FADto,
  LoginDto,
  PasswordDto,
  SignUpDto,
} from '@archi-logi-gt/dtos/dist/authDto';
import { CreateUserDto, Role } from '@archi-logi-gt/dtos/dist/userDTO';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
// eslint-disable-next-line @typescript-eslint/naming-convention
import Redis from 'ioredis';

import { EmailService } from '../email/email.service';
import { User } from '../user/entities/user';
import { UserService } from '../user/user.service';
import { PasswordUtilsService } from '../utils/password-utils.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRedis() private redisService: Redis,
    private emailService: EmailService,
    private passwordUtilsService: PasswordUtilsService,
  ) {}

  async login(login: LoginDto): Promise<string> {
    let userDb;
    try {
      userDb = await this.userService.findByEmail(login);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException();
      }
    }

    if (!userDb?.password) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(login.password, userDb.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    await this.userService.clearResetPasswordToken(+userDb.id);
    if (userDb.resetPasswordToken) {
      await this.invalidateToken(userDb.resetPasswordToken);
    }

    return userDb.isEmailVerified
      ? this.generate2FACode(userDb.email)
      : this.generateJWTTokenForUser(userDb);
  }

  async signup(login: SignUpDto): Promise<boolean> {
    await this.userService.create(new CreateUserDto(login));
    return true;
  }

  async invalidateToken(token: string): Promise<void> {
    const decoded = this.jwtService.decode(token);
    const tokenExpiry = decoded.exp * 1000;

    const currentTime = Date.now();
    const ttl = tokenExpiry - currentTime;

    if (ttl > 0) {
      await this.redisService.set(token, 'blacklisted', 'PX', ttl);
    }
  }

  async isJwtTokenUpToDate(token: string): Promise<boolean> {
    const decodedToken = this.jwtService.decode(token);
    if (!decodedToken) {
      return false;
    }
    if (decodedToken.role === Role.RESET_TOKEN) {
      return true;
    }
    if (decodedToken?.role === Role.TWO_FACTOR_AUTHENTICATION) {
      return true;
    }

    const userDb = await this.userService.findById(decodedToken.id);

    return (
      decodedToken.id === userDb.id &&
      decodedToken.email === userDb.email &&
      decodedToken.role === userDb.role
    );
  }

  async forgotPassword(email: EmailDto) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email.email}`);
    }

    const emailValue = email.email;
    const payload = { email: emailValue, role: Role.RESET_TOKEN };

    const resetPasswordToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });

    user.resetPasswordToken = resetPasswordToken;
    user.password = undefined; // Useful to not update password, see check in userService.update()

    await this.emailService.sendResetPasswordEmail(
      emailValue,
      resetPasswordToken,
    );

    await this.userService.update(user.id, user);

    return {
      value: true,
    };
  }

  async updateUserByResetToken(token: string, password: PasswordDto) {
    this.passwordUtilsService.passwordFormatValidation(password.password);

    const user = await this.userService.findByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid reset token.');
    }

    user.password = password.password;
    user.resetPasswordToken = null;

    await this.userService.update(user.id, user);

    return this.invalidateToken(token);
  }

  async login2FA(
    jwtToken: string,
    userId: string,
    verifyEmail: Login2FADto,
  ): Promise<string> {
    const user2FACode = await this.redisService.get(jwtToken);

    if (!user2FACode || user2FACode !== verifyEmail.verificationCode) {
      throw new UnauthorizedException();
    }

    let userDb: User;
    try {
      userDb = await this.userService.findById(+userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException();
      }
    }

    return this.generateJWTTokenForUser(userDb);
  }

  async generateJWTTokenForUser(user: User): Promise<string> {
    const payload = { id: user.id, email: user.email, role: user.role };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  async generateJWTTokenFor2FA(user: User): Promise<string> {
    const payload = {
      userId: user.id,
      role: Role.TWO_FACTOR_AUTHENTICATION,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  async generateJWTTokenFor2FAAccountVerification(
    email: string,
  ): Promise<string> {
    const payload = { email: email, role: Role.TWO_FACTOR_AUTHENTICATION };
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
  }

  private async generate2FACode(userEmail: string) {
    // eslint-disable-next-line sonarjs/pseudo-random
    const twoFACode = Math.floor(100_000 + Math.random() * 900_000).toString();

    let userDb: User;
    try {
      userDb = await this.userService.findByEmail(
        plainToInstance(EmailDto, { email: userEmail }),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException();
      }
    }

    const jwtCode2FA = await this.generateJWTTokenFor2FA(userDb);

    await this.emailService.send2FACodeEmail(userDb.email, twoFACode);

    await this.redisService.set(jwtCode2FA, twoFACode);

    return jwtCode2FA;
  }

  async verifyAccount(userId: number) {
    let userDb: User;
    try {
      userDb = await this.userService.findById(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException();
      }
    }

    if (userDb.isEmailVerified === false) {
      const jwtValidationEmail =
        await this.generateJWTTokenFor2FAAccountVerification(userDb.email);
      await this.redisService.set(jwtValidationEmail, userDb.id, 'PX', 600_000); //Save JWT for 10 minutes
      await this.emailService.sendVerificationEmail(
        userDb.email,
        jwtValidationEmail,
      );
    }
  }

  async validateAccount(token: string) {
    const userId = await this.redisService.get(token);

    if (!userId) {
      throw new UnauthorizedException();
    }
    await this.invalidateToken(token);

    let userDb: User;
    try {
      userDb = await this.userService.findById(+userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException();
      }
    }

    userDb.isEmailVerified = true;
    userDb.password = undefined; // Useful to not update password, see check in userService.update()
    await this.userService.update(userDb.id, userDb);
  }
}
