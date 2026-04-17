import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createMockUser } from 'src/test/factories/user.factory';
import { mockRequest } from 'src/test/mocks/request.mock';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create user', async () => {
    const user = createMockUser();
    service.createUser.mockResolvedValue(user);

    const result = await controller.createUser({
      email: 'test',
      password: '123',
      pseudonym: 'test',
    });

    expect(result).not.toHaveProperty('password');
  });

  it('should delete user', async () => {
    service.deleteUser.mockResolvedValue({
      message: 'User deleted successfully',
    });

    const req = mockRequest();

    const result = await controller.remove('1', req);

    expect(result.message).toBeDefined();
  });
});