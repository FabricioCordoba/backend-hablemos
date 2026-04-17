import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoggerService } from 'src/common/logger/logger.service';
import { createMockUser } from 'src/test/factories/user.factory';
import { mockLogger } from 'src/test/mocks/logger.mock';
import { createMockRepository } from 'src/test/mocks/repository.mock';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: createMockRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  describe('createUser', () => {
    it('should create user', async () => {
      const dto = {
        email: 'test@example.com',
        password: '123456',
        pseudonym: 'test',
      };

      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(createMockUser());
      repo.save.mockResolvedValue(createMockUser());

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.createUser(dto);

      expect(result).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user without password', async () => {
      repo.findOne.mockResolvedValue(createMockUser());

      const result = await service.findOne(1);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('deleteUser', () => {
    it('should allow owner delete', async () => {
      const user = createMockUser();
      repo.findOne.mockResolvedValue(user);

      const result = await service.deleteUser(1, {
        userId: 1,
        role: user.role,
      });

      expect(result.message).toBeDefined();
    });
  });
});
