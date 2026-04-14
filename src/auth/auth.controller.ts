import { LoginDto } from './dto/login.dto';
import { Controller, Request, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
async getProfile(@Request() req: any) {
  return this.usersService.findOne(req.user.userId);
}
  

  
}
