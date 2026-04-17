import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserRole } from 'src/users/entities/user.entity';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Post } from 'src/posts/entities/post.entity';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepository: jest.Mocked<Repository<Comment>>;
  let postsRepository: jest.Mocked<Repository<Post>>;

  const mockComment = {
    id: 1,
    content: 'Test comment',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 1,
      pseudonym: 'testuser',
      avatar: 'avatar_1',
    },
    post: {
      id: 10,
    },
  };

  const expectedCommentResponse = {
    id: mockComment.id,
    content: mockComment.content,
    createdAt: mockComment.createdAt,
    updatedAt: mockComment.updatedAt,
    author: {
      id: mockComment.author.id,
      pseudonym: mockComment.author.pseudonym,
      avatar: mockComment.author.avatar,
    },
  };

  const mockPost = {
    id: 10,
    content: 'Test post',
  };

  beforeEach(async () => {
    const commentsRepositoryMock = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const postsRepositoryMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: commentsRepositoryMock,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: postsRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentsRepository = module.get(getRepositoryToken(Comment));
    postsRepository = module.get(getRepositoryToken(Post));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('should create a comment when post exists', async () => {
      postsRepository.findOne.mockResolvedValue(mockPost as any);
      commentsRepository.create.mockReturnValue(mockComment as any);
      commentsRepository.save.mockResolvedValue(mockComment as any);
      commentsRepository.findOne.mockResolvedValue(mockComment as any);

      const result = await service.create(
        { content: 'Test comment', postId: 10 },
        1,
      );

      expect(postsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 10 },
      });
      expect(commentsRepository.create).toHaveBeenCalledWith({
        content: 'Test comment',
        author: { id: 1 },
        post: mockPost,
      });
      expect(result).toEqual(expectedCommentResponse);
    });

    it('should throw if post does not exist', async () => {
      postsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ content: 'Test comment', postId: 999 }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByPost', () => {
    it('should return comments ordered by createdAt desc', async () => {
      commentsRepository.find.mockResolvedValue([mockComment] as any);

      const result = await service.findByPost(10);

      expect(commentsRepository.find).toHaveBeenCalledWith({
        where: { post: { id: 10 } },
        order: { createdAt: 'DESC' },
        relations: ['author'],
      });
      expect(result).toEqual([expectedCommentResponse]);
    });
  });

  describe('update', () => {
    it('should update a comment when user is the author', async () => {
      commentsRepository.findOne.mockResolvedValue(mockComment as any);
      commentsRepository.save.mockResolvedValue({
        ...mockComment,
        content: 'Updated comment',
      } as any);

      const result = await service.update(
        1,
        { content: 'Updated comment' },
        1,
      );

      expect(result).toEqual({
        ...expectedCommentResponse,
        content: 'Updated comment',
      });
      expect(commentsRepository.save).toHaveBeenCalledWith({
        ...mockComment,
        content: 'Updated comment',
      });
    });

    it('should throw if comment does not exist', async () => {
      commentsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { content: 'Updated comment' }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user is not the author', async () => {
      commentsRepository.findOne.mockResolvedValue(mockComment as any);

      await expect(
        service.update(1, { content: 'Updated comment' }, 2),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a comment when user is the author', async () => {
      commentsRepository.findOne.mockResolvedValue(mockComment as any);
      commentsRepository.remove.mockResolvedValue(mockComment as any);

      const result = await service.remove(1, 1, UserRole.USER);

      expect(result).toEqual({
        message: 'Comment deleted successfully',
      });
      expect(commentsRepository.remove).toHaveBeenCalledWith(mockComment);
    });

    it('should allow admin to remove another users comment', async () => {
      commentsRepository.findOne.mockResolvedValue(mockComment as any);
      commentsRepository.remove.mockResolvedValue(mockComment as any);

      const result = await service.remove(1, 2, UserRole.ADMIN);

      expect(result).toEqual({
        message: 'Comment deleted successfully',
      });
    });

    it('should throw if comment does not exist', async () => {
      commentsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(999, 1, UserRole.USER),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user is not the author and not admin', async () => {
      commentsRepository.findOne.mockResolvedValue(mockComment as any);

      await expect(
        service.remove(1, 2, UserRole.USER),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
