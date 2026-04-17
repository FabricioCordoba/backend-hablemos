import { Test, TestingModule } from '@nestjs/testing';
import { createMockUser } from 'src/test/factories/user.factory';
import { mockRequest } from 'src/test/mocks/request.mock';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const publicUser = {
    id: 1,
    pseudonym: 'testuser',
    avatar: 'avatar_1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
            findProfile: jest.fn(),
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

  it('should create user with public response only', async () => {
    const user = createMockUser();
    service.createUser.mockResolvedValue(user);
    service.findOne.mockResolvedValue(publicUser as any);

    const result = await controller.createUser({
      email: 'test',
      password: '123',
      pseudonym: 'test',
    });

    expect(service.findOne).toHaveBeenCalledWith(user.id);
    expect(result).not.toHaveProperty('email');
    expect(result).not.toHaveProperty('role');
  });

  it('should update user', async () => {
    const req = mockRequest();
    service.updateUser.mockResolvedValue({
      ...publicUser,
      pseudonym: 'updated',
    } as any);

    const result = await controller.updateUser(
      1,
      { pseudonym: 'updated' },
      req,
    );

    expect(service.updateUser).toHaveBeenCalledWith(
      1,
      { pseudonym: 'updated' },
      req.user,
    );
    expect(result.pseudonym).toBe('updated');
  });

  it('should delete user', async () => {
    service.deleteUser.mockResolvedValue({
      message: 'User deleted successfully',
    });

    const req = mockRequest();

    const result = await controller.remove(1, req);

    expect(result.message).toBeDefined();
  });
});
