import {BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailDto } from '@archi-logi-gt/dtos/dist/authDto';
import { CreateUserDto, UpdateUserDto } from '@archi-logi-gt/dtos/dist/userDTO';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { PasswordUtilsService } from '../utils/password-utils.service';
import { User } from './entities/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private passwordUtilsService: PasswordUtilsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.passwordUtilsService.passwordFormatValidation(createUserDto.password);

    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      +process.env.BCRYPT_PASSWORD_SALT,
    );

    const userData = this.userRepository.create(createUserDto);
    return this.userRepository.save(userData);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findById(id: number): Promise<User> {
   if (!id){
     throw new BadRequestException("No parameter 'id' found")
   }

   const userData = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userData) {
      throw new NotFoundException('User Not Found');
    }

    return userData;
  }

  async findByEmail(email: EmailDto): Promise<User> {
    const userData = await this.userRepository.findOne({
      where: {
        email: email.email,
      },
    });

    if (!userData) {
      throw new NotFoundException('User Not Found');
    }

    return userData;
  }

  async findByToken(token: string): Promise<User> {
    const userData = await this.userRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!userData) {
      throw new NotFoundException('User Not Found');
    }

    return userData;
  }

  async clearResetPasswordToken(userId: number) {
    const user = await this.findById(userId);
    user.resetPasswordToken = null;
    await this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      this.passwordUtilsService.passwordFormatValidation(
        updateUserDto.password,
      );

      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        +process.env.BCRYPT_PASSWORD_SALT,
      );
    }

    const existingUser = await this.findById(id);
    const userData = this.userRepository.merge(existingUser, {
      ...updateUserDto,
    });
    return this.userRepository.save(userData);
  }

  async remove(id: number): Promise<User> {
    const existingUser = await this.findById(id);
    return this.userRepository.remove(existingUser);
  }
}
