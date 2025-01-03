import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { 
  CreateUserDto, 
  NewUser, 
  UpdateUserDto, 
  UserResponseDto,
  createUserSchema,
  updateUserSchema 
} from '@microservices-app/shared/types';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { ZodValidationPipe } from '@microservices-app/shared/backend';
import { JwtAuthGuard, RolesGuard, Roles } from '@microservices-app/shared/backend';
import { UserRole } from '@microservices-app/shared/types';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  async createUser(
    @Body(new ZodValidationPipe(createUserSchema)) createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    return this.userService.createUser(createUserDto as NewUser);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.CONSULTANT)
  async findAllUsers(): Promise<UserResponseDto[]> {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CONSULTANT)
  async findUser(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.userService.findUserById(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
} 