import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import {
  EmailDto,
  Login2FADto,
  LoginDto,
  PasswordDto,
  SignUpDto,
  TokenDto,
} from '@archi-logi-gt/dtos/dist/authDto';
import { plainToInstance } from 'class-transformer';

import { Public } from '../decorators/public.decorator';
import { TwoFA } from '../decorators/twoFA.decorator';
import { AuthenticationService } from './authentication.service';

@ApiTags('authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @Public()
  @Post('signup')
  signup(@Body() signUpDto: SignUpDto): Promise<boolean> {
    return this.authenticationService.signup(signUpDto);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: TokenDto })
  @Public()
  @Post('login')
  async login(@Body() loginUser: LoginDto): Promise<TokenDto> {
    return plainToInstance(TokenDto, {
      token: await this.authenticationService.login(loginUser),
    });
  }

  @ApiOperation({ summary: 'Logout user and invalidate token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth()
  @Post('logout')
  logout(@Req() req: Request) {
    return this.authenticationService.invalidateToken(req['token']);
  }

  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() forgotPassword: EmailDto) {
    return this.authenticationService.forgotPassword(forgotPassword);
  }

  @ApiOperation({ summary: 'Update password with reset token' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiBearerAuth()
  @Post('update-password')
  updatePassword(@Body() password: PasswordDto, @Req() req: Request) {
    return this.authenticationService.updateUserByResetToken(
      req['token'],
      password,
    );
  }

  @ApiOperation({ summary: 'Verify user account' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiBearerAuth()
  @Post('verify-account')
  async verifyAccount(@Req() req: Request) {
    return this.authenticationService.verifyAccount(
      req['user']?.id,
    );
  }

  @ApiOperation({ summary: 'Validate account verification' })
  @ApiResponse({ status: 200, description: 'Account validated' })
  @TwoFA()
  @Post('validate-account')
  validateAccountVerification(@Req() req: Request) {
    return this.authenticationService.validateAccount(
      req['token'],
    );
  }

  @ApiOperation({ summary: 'Complete 2FA login' })
  @ApiResponse({ status: 200, description: '2FA login successful', type: TokenDto })
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
