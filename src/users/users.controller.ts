import { Controller, Body, Post, Get, Patch, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';




@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService
    ) { }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.createUser(createUserDto);
        const { password, ...result } = user;
        return result as User;
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateUser(id, updateUserDto);
    }



    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(
        @Param('id') id: string,
        @Request() req: any,
    ) {
        return this.usersService.deleteUser(
            +id,
            req.user, // 👈 viene del JWT
        );
    }
}