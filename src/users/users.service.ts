import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoggerService } from '../common/logger/logger.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PrivateUserProfileDto } from './dto/private-user-profile.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private logger: LoggerService,
  ) {}

  private mapPublicUser(user: User): PublicUserDto {
    return {
      id: user.id,
      pseudonym: user.pseudonym,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private mapPrivateProfile(user: User): PrivateUserProfileDto {
    return {
      id: user.id,
      email: user.email,
      pseudonym: user.pseudonym,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.logInfo('Creating new user', 'createUser', {
      email: createUserDto.email,
    });
    const { email, password, pseudonym } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      pseudonym,
      avatar: createUserDto.avatar,
    });

    const savedUser = await this.usersRepository.save(user);

    return savedUser;
  }

  async findAll(): Promise<PublicUserDto[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.mapPublicUser(user));
  }

  async findOne(id: number): Promise<PublicUserDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapPublicUser(user);
  }

  async findProfile(id: number): Promise<PrivateUserProfileDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapPrivateProfile(user);
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: { userId: number; role: UserRole },
  ): Promise<PublicUserDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.userId !== id && currentUser.role !== UserRole.ADMIN) {
      this.logger.logWarn('Unauthorized user update attempt', 'updateUser', {
        userId: currentUser.userId,
        targetUserId: id,
        userRole: currentUser.role,
      });
      throw new ForbiddenException('You cannot update this user');
    }

    if (updateUserDto.pseudonym !== undefined) {
      user.pseudonym = updateUserDto.pseudonym;
    }
    if (updateUserDto.avatar !== undefined) {
      user.avatar = updateUserDto.avatar;
    }

    const updatedUser = await this.usersRepository.save(user);

    return this.mapPublicUser(updatedUser);
  }

  async deleteUser(
    id: number,
    currentUser: { userId: number; role: UserRole },
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.userId !== id) {
      if (currentUser.role !== UserRole.ADMIN) {
        this.logger.logWarn(
          'Unauthorized user deletion attempt',
          'deleteUser',
          {
            userId: currentUser.userId,
            targetUserId: id,
            userRole: currentUser.role,
          },
        );
        throw new ForbiddenException('You cannot delete this user');
      }
    }

    await this.usersRepository.remove(user);
    return {
      message: 'User deleted successfully',
    };
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }
}
