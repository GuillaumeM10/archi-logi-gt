import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  EmailDto,
  Login2FADto,
  LoginDto,
  PasswordDto,
  SignUpDto,
  TokenDto,
} from '@spottobe/dtos/dist/authDto';
import { plainToInstance } from 'class-transformer';

import { Public } from '../decorators/public.decorator';
import { TwoFA } from '../decorators/twoFA.decorator';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @Post('signup')
  signup(@Body() signUpDto: SignUpDto): Promise<boolean> {
    return this.authenticationService.signup(signUpDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginUser: LoginDto): Promise<TokenDto> {
    return plainToInstance(TokenDto, {
      token: await this.authenticationService.login(loginUser),
    });
  }

  @Post('logout')
  logout(@Req() req: Request) {
    return this.authenticationService.invalidateToken(req['token']);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() forgotPassword: EmailDto) {
    return this.authenticationService.forgotPassword(forgotPassword);
  }

  @Post('update-password')
  updatePassword(@Body() password: PasswordDto, @Req() req: Request) {
    return this.authenticationService.updateUserByResetToken(
      req['token'],
      password,
    );
  }

  @Post('verify-account')
  async verifyAccount(@Req() req: Request) {
    return this.authenticationService.verifyAccount(
      req['user']?.id,
    );
  }

  @TwoFA()
  @Post('validate-account')
  validateAccountVerification(@Req() req: Request) {
    return this.authenticationService.validateAccount(
      req['token'],
    );
  }

  @TwoFA()
  @Post('login-2FA')
  async login2FA(
    @Body() verifyEmail: Login2FADto,
    @Req() req: Request,
  ): Promise<TokenDto> {
    return plainToInstance(TokenDto, {
      token: await this.authenticationService.login2FA(
        req['token'],
        req['user'].userId,
        verifyEmail,
      ),
    });
  }
}
