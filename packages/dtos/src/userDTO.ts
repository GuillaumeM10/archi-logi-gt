import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  RESET_TOKEN = "RESET_TOKEN",
  TWO_FACTOR_AUTHENTICATION = "TWO_FACTOR_AUTHENTICATION",
}

export class CreateUserDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'Password123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: Role,
    default: Role.USER,
    example: Role.USER
  })
  @IsEnum(Role)
  role: Role = Role.USER;

  constructor(partial: Partial<CreateUserDto>) {
    Object.assign(this, partial);
    this.role = this.role || Role.USER;
  }
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
