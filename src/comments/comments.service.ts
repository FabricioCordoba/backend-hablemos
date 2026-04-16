import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { UserRole } from 'src/users/entities/user.entity';


@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) { }


  async create(createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    const post = await this.postsRepository.findOne({
      where: { id: createCommentDto.postId }
    })

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      author: { id: userId },
      post,
    })
    return this.commentsRepository.save(comment);
  }

  async findByPost(postId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { post: { id: postId } },
      order: { createdAt: 'DESC' },
      relations: ['author'],
    })
  }

  async update(id: number, updateCommentDto: UpdateCommentDto, userId: number): Promise<Comment> {

    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author']
    })

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException('Not your comment');
    }

    if (updateCommentDto.content !== undefined) {
      comment.content = updateCommentDto.content;
    }

    return this.commentsRepository.save(comment);

  }

  async remove(id: number, userId: number, role: UserRole): Promise<{ message: string }> {

    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author']
    })

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot delete this comment')
    }

    await this.commentsRepository.remove(comment);

    return { message: 'Comment deleted successfully' };
  }
}
