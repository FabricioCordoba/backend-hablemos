import { Test, TestingModule } from '@nestjs/testing';
import { createMockUser } from 'src/test/factories/user.factory';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should register user', async () => {
    authService.register.mockResolvedValue({
      access_token: 'token',
    });

    const result = await controller.register({
      email: 'test',
      password: '123',
      pseudonym: 'test',
    });

    expect(result.access_token).toBeDefined();
  });

  it('should login user', async () => {
    authService.login.mockResolvedValue({
      access_token: 'token',
    });

    const result = await controller.login({
      email: 'test',
      password: '123',
    });

    expect(result.access_token).toBeDefined();
  });

  it('should return profile', async () => {
    const user = createMockUser();
    const jwtUser = {
      userId: user.id,
      role: user.role,
    };

    usersService.findOne.mockResolvedValue(user);

    const result = await controller.getProfile(jwtUser);

    expect(result).toBeDefined();
    expect(usersService.findOne).toHaveBeenCalledWith(jwtUser.userId);
  });
});
