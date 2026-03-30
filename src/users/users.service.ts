import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }


    async createUser(CreateUserDto: CreateUserDto): Promise<User> {
        const { email, password, pseudonym } = CreateUserDto

        const existingUser = await this.usersRepository.findOne({
            where: { email }
        })

        if (existingUser) {
            throw new BadRequestException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.usersRepository.create({
            email,
            password: hashedPassword,
            pseudonym,
            avatar: CreateUserDto.avatar
        })

        const savedUser = await this.usersRepository.save(user);

        const { password: _, ...result } = savedUser;

        return result as User;

    }

    async findAll(): Promise<User[]> {
        const users = await this.usersRepository.find();
        const usersList = users.map(({ password, ...user }) => user);
        return usersList as User[];
    }

    async findOne(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }
        const { password, ...result } = user;

        return result as User;
    }


    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id }
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (updateUserDto.pseudonym !== undefined) {
            user.pseudonym = updateUserDto.pseudonym;
        }
        if (updateUserDto.avatar !== undefined) {
            user.avatar = updateUserDto.avatar;
        }

        const updatedUser = await this.usersRepository.save(user);
        const { password, ...result } = updatedUser;

        return result as User;
    }

    async deleteUser(id: number, currentUser: any): Promise<{ message: string }> {

        const user = await this.usersRepository.findOne({
            where: { id },
        })

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (currentUser.userId !== id) {

            if (currentUser.role !== UserRole.ADMIN) {
                throw new ForbiddenException('YOu cannot delete this user?')
            }
        }

        await this.usersRepository.remove(user);
        return {
            message: 'User deleted successfully'
        }
    }


}