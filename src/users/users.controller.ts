import { Controller, Body, Post, Get, Patch, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
//import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';



@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService
    ) { }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findById(@Body('id') id: number) {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.updateUser(id, updateUserDto);
    }



    @Delete(':id')
    //@UseGuards(JwtAuthGuard)
    remove(
        @Param('id') id: string,
        @Request() req,
    ) {
        return this.usersService.deleteUser(
            +id,
            req.user, // 👈 clave
        );
    }
}