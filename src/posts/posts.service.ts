import { User, UserRole } from 'src/users/entities/user.entity';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorPublicDto, PostResponseDto } from './dto/post-response.dto';
import { PaginatedPostsDto } from './dto/paginated-posts.dto';
import { AuthorResponseDto } from './dto/post-response.dto';
import { CommentResponseDto } from 'src/comments/dto/comment-response.dto';
import { Comment } from 'src/comments/entities/comment.entity';
import { PostDetailResponseDto } from './dto/post-detail-response.dto';
import { PostFeedDto } from './dto/post-feed-dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) { }


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
      author: this.mapAuthor(comment.author),
    };
  }
//--------------------------------------------------
private mapPost(post: Post): PostResponseDto {
  return {
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: this.mapAuthor(post.author),
  };
}

private mapPostDetail(post: Post): PostDetailResponseDto {
  return {
    ...this.mapPost(post),
    comments: post.comments?.map((c) => this.mapComment(c)) || [],
  };
}



  // 🔥 helper reutilizable
  private async findPostOrFail(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  // 🔥 CREATE
  async create(
    createPostDto: CreatePostDto,
    userId: number,
  ): Promise<PostResponseDto> {
    const post = this.postsRepository.create({
      content: createPostDto.content,
      author: { id: userId } as any,
    });

    const saved = await this.postsRepository.save(post);

    const fullPost = await this.findPostOrFail(saved.id);

    return this.mapPost(fullPost);
  }

  // 🔥 UPDATE
  async update(
    id: number,
    updateDto: UpdatePostDto,
    userId: number,
  ): Promise<PostResponseDto> {
    const post = await this.findPostOrFail(id);

    if (post.author.id !== userId) {
      throw new ForbiddenException(
        'You are not the author of this post',
      );
    }

    if (updateDto.content !== undefined) {
      post.content = updateDto.content;
    }

    const updated = await this.postsRepository.save(post);

    return this.mapPost(updated);
  }

  // 🔥 DELETE
  async remove(id: number, userId: number, role: UserRole):Promise<{ message: string }> {
    const post = await this.findPostOrFail(id);

    if (post.author.id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You cannot delete this post',
      );}

    await this.postsRepository.remove(post);

    return { message: 'Post deleted' };
  }

  // 🔥 GET ALL
async findAll(page = 1, limit = 10): Promise<PaginatedPostsDto> {
  const [posts, total] = await this.postsRepository.findAndCount({
    relations: ['author'],
    take: limit,
    skip: (page - 1) * limit,
    order: { createdAt: 'DESC' },
  });

  return {
    data: posts.map((p) => this.mapPost(p)),
    total,
    page,
    lastPage: Math.ceil(total / limit),
  };
}

async findFeed(page = 1, limit = 10): Promise<PostFeedDto[]> {
  const query = this.postsRepository
    .createQueryBuilder('post')
    .leftJoin('post.author', 'author')
    .loadRelationCountAndMap(
      'post.commentsCount',
      'post.comments',
    )
    .select([
      'post.id',
      'post.content',
      'post.createdAt',
      'author.id',
      'author.pseudonym',
      'author.avatar',
    ])
    .orderBy('post.createdAt', 'DESC')
    .take(limit)
    .skip((page - 1) * limit);

  const posts = await query.getMany();

  return posts.map((post: any) => ({
    id: post.id,
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      pseudonym: post.author.pseudonym,
      avatar: post.author.avatar,
    },
    commentsCount: post.commentsCount,
  }));
}

async findOne(id: number): Promise<PostDetailResponseDto> {
  const post = await this.postsRepository.findOne({
    where: { id },
    relations: ['author', 'comments', 'comments.author'],
  });

  if (!post) throw new NotFoundException();

  return this.mapPostDetail(post);
}
}