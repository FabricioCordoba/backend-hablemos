import { LoginDto } from './dto/login.dto';
import { Controller, Request, Get, Post, Body, UseGuards, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtUser } from './interfaces/jwt-payload.interface';
import { User } from 'src/common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
  private readonly authService: AuthService,
  private readonly usersService: UsersService,
) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('login')
  login(@Body() loginDto: LoginDto) {
return this.authService.login(loginDto.email, loginDto.password);
  }


@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@User() user: JwtUser) {
  return this.usersService.findOne(user.userId);
}
  
@Delete(':id')
@UseGuards(JwtAuthGuard)
remove(
 @Param('id', ParseIntPipe) id: number,
  @User() user: JwtUser,
) {
  return this.usersService.deleteUser(
    +id,
    user,
  );
}
  
}
