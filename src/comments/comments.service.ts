import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole, User } from 'src/users/entities/user.entity';
import { AuthorPublicDto } from 'src/posts/dto/post-response.dto';
import { Post } from '../posts/entities/post.entity';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  private mapAuthor(user: User): AuthorPublicDto {
    return {
      id: user.id,
      pseudonym: user.pseudonym,
      avatar: user.avatar,
    };
  }

  private mapComment(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: this.mapAuthor(comment.author),
    };
  }

  private async findCommentOrFail(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async create(
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<CommentResponseDto> {
    const post = await this.postsRepository.findOne({
      where: { id: createCommentDto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      author: { id: userId } as User,
      post,
    });

    const savedComment = await this.commentsRepository.save(comment);
    const fullComment = await this.findCommentOrFail(savedComment.id);

    return this.mapComment(fullComment);
  }

  async findByPost(postId: number): Promise<CommentResponseDto[]> {
    const comments = await this.commentsRepository.find({
      where: { post: { id: postId } },
      order: { createdAt: 'DESC' },
      relations: ['author'],
    });

    return comments.map((comment) => this.mapComment(comment));
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.findCommentOrFail(id);

    if (comment.author.id !== userId) {
      throw new ForbiddenException('Not your comment');
    }

    if (updateCommentDto.content !== undefined) {
      comment.content = updateCommentDto.content;
    }

    const updatedComment = await this.commentsRepository.save(comment);

    return this.mapComment(updatedComment);
  }

  async remove(
    id: number,
    userId: number,
    role: UserRole,
  ): Promise<{ message: string }> {
    const comment = await this.findCommentOrFail(id);

    if (comment.author.id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    await this.commentsRepository.remove(comment);

    return { message: 'Comment deleted successfully' };
  }
}
