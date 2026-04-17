import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from 'src/users/entities/user.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  const mockCommentResponse = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 1,
      pseudonym: 'testuser',
      avatar: 'avatar_1',
    },
  };

  const mockReq = {
    user: {
      userId: 1,
      role: UserRole.USER,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            findByPost: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get(CommentsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a comment', async () => {
    service.create.mockResolvedValue(mockCommentResponse as any);

    const result = await controller.create(
      { content: 'Test comment', postId: 10 },
      mockReq,
    );

    expect(service.create).toHaveBeenCalledWith(
      { content: 'Test comment', postId: 10 },
      1,
    );
    expect(result).toEqual(mockCommentResponse);
  });

  it('should return comments by post', async () => {
    service.findByPost.mockResolvedValue([mockCommentResponse] as any);

    const result = await controller.findByPost(10);

    expect(service.findByPost).toHaveBeenCalledWith(10);
    expect(result).toEqual([mockCommentResponse]);
  });

  it('should update a comment', async () => {
    service.update.mockResolvedValue({
      ...mockCommentResponse,
      content: 'Updated comment',
    } as any);

    const result = await controller.update(
      1,
      { content: 'Updated comment' },
      mockReq,
    );

    expect(service.update).toHaveBeenCalledWith(
      1,
      { content: 'Updated comment' },
      1,
    );
    expect(result.content).toBe('Updated comment');
  });

  it('should remove a comment', async () => {
    service.remove.mockResolvedValue({
      message: 'Comment deleted successfully',
    });

    const result = await controller.remove(1, mockReq);

    expect(service.remove).toHaveBeenCalledWith(1, 1, UserRole.USER);
    expect(result).toEqual({
      message: 'Comment deleted successfully',
    });
  });
});
