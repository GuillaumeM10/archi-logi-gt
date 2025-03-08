import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class EmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class PasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class TokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class Login2FADto {
  @IsNotEmpty()
  @IsString()
  verificationCode: string;
}
