import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
      private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMaatch = await bcrypt.compare(password, user.password);

    if (!isMaatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password: _, ...result } = user;
return result;
  
  }


  async register (dto: RegisterDto){
    const user = await this.usersService.createUser(dto);
    const payload = {
      sub: user.id,
      role: user.role
    }
    return {
      access_token: this.jwtService.sign(payload),
    }

  }

async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      role: user.role

    }

    return{
      access_token: this.jwtService.sign(payload),
    }
  }

}

