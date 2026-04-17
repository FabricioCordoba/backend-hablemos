import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { mockJwtService } from 'src/test/mocks/jwt.mock';
import { createMockUser } from 'src/test/factories/user.factory';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  // ---------------- VALIDATE ----------------
  describe('validateUser', () => {
    it('should validate user', async () => {
      const user = createMockUser();

      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(user.email, '123');

      expect(result).not.toHaveProperty('password');
    });

    it('should throw if invalid password', async () => {
      const user = createMockUser();

      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser(user.email, 'wrong'),
      ).rejects.toThrow();
    });
  });

  // ---------------- REGISTER ----------------
  describe('register', () => {
    it('should return token', async () => {
      const user = createMockUser();

      usersService.createUser.mockResolvedValue(user);

      const result = await service.register({
        email: 'test',
        password: '123',
        pseudonym: 'test',
      });

      expect(result.access_token).toBeDefined();
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  // ---------------- LOGIN ----------------
  describe('login', () => {
    it('should login user', async () => {
      const user = createMockUser();

      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(user.email, '123');

      expect(result.access_token).toBeDefined();
    });
  });
});