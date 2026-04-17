import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { UserRole } from 'src/users/entities/user.entity';
import { PaginatedPostFeedDto } from './dto/paginated-post-feed.dto';
import { PaginatedPostsDto } from './dto/paginated-posts.dto';
import { PostResponseDto } from './dto/post-response.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let service: jest.Mocked<PostsService>;

  // 🔥 FACTORY (clave para escalar tests)
  const createMockPost = (): PostResponseDto => ({
    id: 1,
    content: 'Test post',
    createdAt: new Date(),
    author: {
      id: 1,
      pseudonym: 'testuser',
      avatar: 'avatar_1',
    },
  });

  const mockUser = {
    userId: 1,
    role: UserRole.USER,
  };

  const mockReq = {
    user: mockUser,
  };

  beforeEach(async () => {
    const mockService: jest.Mocked<PostsService> = {
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findFeed: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(PostsController);
    service = module.get(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------
  describe('create', () => {
    it('should create a post', async () => {
      const mockPost = createMockPost();

      service.create.mockResolvedValue(mockPost);

      const result = await controller.create(
        { content: 'Test post' },
        mockReq,
      );

      expect(service.create).toHaveBeenCalledWith(
        { content: 'Test post' },
        mockUser.userId,
      );

      expect(result).toEqual(mockPost);
    });
  });

  // ---------------- UPDATE ----------------
  describe('update', () => {
    it('should update a post', async () => {
      const updatedPost = {
        ...createMockPost(),
        content: 'Updated',
      };

      service.update.mockResolvedValue(updatedPost);

      const result = await controller.update(
        1,
        { content: 'Updated' },
        mockReq,
      );

      expect(service.update).toHaveBeenCalledWith(
        1,
        { content: 'Updated' },
        mockUser.userId,
      );

      expect(result.content).toBe('Updated');
    });
  });

  // ---------------- DELETE ----------------
  describe('remove', () => {
    it('should delete post', async () => {
      service.remove.mockResolvedValue({
        message: 'Post deleted',
      });

      const result = await controller.remove(1, mockReq);

      expect(service.remove).toHaveBeenCalledWith(
        1,
        mockUser.userId,
        mockUser.role,
      );

      expect(result.message).toBe('Post deleted');
    });
  });

  // ---------------- FIND ALL ----------------
  describe('findAll', () => {
    it('should return paginated posts', async () => {
      const mockPost = createMockPost();

      const paginated: PaginatedPostsDto = {
        data: [mockPost],
        total: 1,
        page: 1,
        lastPage: 1,
      };

      service.findAll.mockResolvedValue(paginated);

      const result = await controller.findAll(1, 10);

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginated);
    });
  });

  // ---------------- FIND ONE ----------------
  describe('findOne', () => {
    it('should return a post detail', async () => {
      const postDetail = {
        ...createMockPost(),
        comments: [],
      };

      service.findOne.mockResolvedValue(postDetail as any);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });

  // ---------------- FEED ----------------
  describe('findFeed', () => {
    it('should return feed', async () => {
      const feed: PaginatedPostFeedDto = {
        data: [
          {
            ...createMockPost(),
            commentsCount: 5,
          },
        ],
        total: 1,
        page: 1,
        lastPage: 1,
      };

      service.findFeed.mockResolvedValue(feed as any);

      const result = await controller.findFeed(1, 10);

      expect(service.findFeed).toHaveBeenCalledWith(1, 10);
      expect(result.data[0].commentsCount).toBe(5);
      expect(result.total).toBe(1);
    });
  });
});
