import { Controller, Post, Body, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

import { CreateUserDto, LoginUserDto } from './dto';

import { User } from './entities/user.entity';
import { GetUser, RawHeaders, RoleProtected } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: "Private route accessed successfully",
      user,
      userEmail,
      rawHeaders
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    };
  }
}
