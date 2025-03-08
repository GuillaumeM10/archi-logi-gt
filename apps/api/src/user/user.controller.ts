import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  CreateUserDto,
  Role,
  UpdateUserDto,
} from '@spottobe/dtos/dist/userDTO';
import { plainToInstance } from 'class-transformer';

import { User } from './entities/user';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = new CreateUserDto(createUserDto);

    const data = await this.userService.create(user);

    return {
      success: true,
      data: plainToInstance(User, data),
      message: 'User Created Successfully',
    };
  }

  @Get()
  async findAll() {
    const data: User[] = await this.userService.findAll();
    return {
      success: true,
      data: data.map((user: User) => plainToInstance(User, user)),
      message: 'User Fetched Successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findById(+id);
    return {
      success: true,
      data: plainToInstance(User, data),
      message: 'User Fetched Successfully',
    };
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (req['user']?.role !== Role.ADMIN) {
      delete updateUserDto.role;
    }
    const data = await this.userService.update(+id, updateUserDto);
    return {
      success: true,
      data: plainToInstance(User, data),
      message: 'User Updated Successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.userService.remove(+id);
    return {
      success: true,
      data: plainToInstance(User, data),
      message: 'User Deleted Successfully',
    };
  }
}
