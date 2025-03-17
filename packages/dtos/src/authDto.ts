import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignUpDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class EmailDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class PasswordDto {
  @ApiProperty({ description: 'New password', example: 'NewPassword123' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class TokenDto {
  @ApiProperty({ description: 'JWT token' })
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class Login2FADto {
  @ApiProperty({ description: 'Two-factor verification code', example: '123456' })
  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
