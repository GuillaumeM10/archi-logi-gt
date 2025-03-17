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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import {
  CreateUserDto,
  Role,
  UpdateUserDto,
} from '@archi-logi-gt/dtos/dist/userDTO';
import { plainToInstance } from 'class-transformer';

import { User } from './entities/user';
import { UserService } from './user.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
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

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  @Get()
  async findAll() {
    const data: User[] = await this.userService.findAll();
    return {
      success: true,
      data: data.map((user: User) => plainToInstance(User, user)),
      message: 'User Fetched Successfully',
    };
  }

  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findById(+id);
    return {
      success: true,
      data: plainToInstance(User, data),
      message: 'User Fetched Successfully',
    };
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
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

  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
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
