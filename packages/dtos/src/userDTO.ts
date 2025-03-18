import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
  RESET_TOKEN = "RESET_TOKEN",
  TWO_FACTOR_AUTHENTICATION = "TWO_FACTOR_AUTHENTICATION",
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role = Role.USER;

  constructor(partial: Partial<CreateUserDto>) {
    Object.assign(this, partial);
    this.role = this.role || Role.USER;
  }
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
