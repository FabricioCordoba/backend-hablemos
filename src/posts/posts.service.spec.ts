import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

describe('PostsService', () => {
  let service: PostsService;
  let repo: jest.Mocked<Repository<Post>>;

  const mockPost = {
    id: 1,
    content: 'Test post',
    createdAt: new Date(),
    updatedAy: new Date(),
    author: {
      id: 1,
      pseudonym: 'testuser',
      avatar: 'avatar_1',
      password: 'hashed',
    },
    comments: [],
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repo = module.get(getRepositoryToken(Post));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- CREATE ----------------
  describe('create', () => {
    it('should create a post', async () => {
      repo.create.mockReturnValue(mockPost as any);
      repo.save.mockResolvedValue({ ...mockPost } as any);
      repo.findOne.mockResolvedValue(mockPost as any);

      const result = await service.create(
        { content: 'Test post' },
        1,
      );

      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.content).toBe('Test post');
    });
  });

  // ---------------- UPDATE ----------------
  describe('update', () => {
    it('should update post if author', async () => {
      repo.findOne.mockResolvedValue(mockPost as any);
      repo.save.mockResolvedValue({
        ...mockPost,
        content: 'Updated',
      } as any);

      const result = await service.update(
        1,
        { content: 'Updated' },
        1,
      );

      expect(result.content).toBe('Updated');
    });

    it('should throw Forbidden if not author', async () => {
      repo.findOne.mockResolvedValue({
        ...mockPost,
        author: { id: 2 },
      } as any);

      await expect(
        service.update(1, { content: 'x' }, 1),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ---------------- DELETE ----------------
  describe('remove', () => {
    it('should delete if owner', async () => {
      repo.findOne.mockResolvedValue(mockPost as any);
      repo.remove.mockResolvedValue(mockPost as any);

      const result = await service.remove(
        1,
        1,
        UserRole.USER,
      );

      expect(result.message).toBe('Post deleted');
    });

    it('should allow admin', async () => {
      repo.findOne.mockResolvedValue(mockPost as any);
      repo.remove.mockResolvedValue(mockPost as any);

      const result = await service.remove(
        1,
        2,
        UserRole.ADMIN,
      );

      expect(result.message).toBe('Post deleted');
    });

    it('should throw Forbidden', async () => {
      repo.findOne.mockResolvedValue({
        ...mockPost,
        author: { id: 2 },
      } as any);

      await expect(
        service.remove(1, 3, UserRole.USER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ---------------- FIND ALL ----------------
  describe('findAll', () => {
    it('should return paginated posts', async () => {
      repo.findAndCount.mockResolvedValue([
        [mockPost, { ...mockPost, id: 2 }] as any,
        2,
      ]);

      const result = await service.findAll(1, 10);

      expect(result.total).toBe(2);
      expect(result.data.length).toBe(2);
      expect(result.page).toBe(1);
    });
  });

  // ---------------- FIND ONE ----------------
  describe('findOne', () => {
    it('should return post detail', async () => {
      repo.findOne.mockResolvedValue(mockPost as any);

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });

    it('should throw NotFound', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ---------------- FEED ----------------
  describe('findFeed', () => {
    it('should return feed with commentsCount', async () => {
      const mockQB: any = {
        leftJoin: jest.fn().mockReturnThis(),
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([
          [
            {
              id: 1,
              content: 'Feed post',
              createdAt: new Date(),
              commentsCount: 5,
              author: {
                id: 1,
                pseudonym: 'testuser',
                avatar: 'avatar_1',
              },
            },
          ],
          1,
        ]),
      };

      repo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findFeed(1, 10);

      expect(result.total).toBe(1);
      expect(result.data[0].commentsCount).toBe(5);
      expect(result.page).toBe(1);
      expect(mockQB.getManyAndCount).toHaveBeenCalled();
    });
  });

  // ---------------- PRIVATE (INDIRECT) ----------------
  describe('findPostOrFail', () => {
    it('should throw if post not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { content: 'x' }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
