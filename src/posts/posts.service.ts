import { UserRole } from 'src/users/entities/user.entity';
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
import { PostResponseDto } from './dto/post-response.dto';
import { PaginatedPostsDto } from './dto/paginated-posts.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  // 🔥 mapper único
  private toPostResponse(post: Post): PostResponseDto {
    const { password, ...author } = post.author;

    return {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author,
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

    return this.toPostResponse(fullPost);
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

    return this.toPostResponse(updated);
  }

  // 🔥 DELETE
  async remove(id: number, userId: number, role: UserRole) {
    const post = await this.findPostOrFail(id);

    if (post.author.id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You cannot delete this post',
      );
    }

    await this.postsRepository.remove(post);

    return { message: 'Post deleted' };
  }

  // 🔥 GET ALL
  async findAll(page = 1, limit = 10): Promise<PaginatedPostsDto> {
    const [posts, total] = await this.postsRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['author'],
    });

    const data = posts.map((post) =>
      this.toPostResponse(post),
    );

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // 🔥 GET BY ID
  async findOne(id: number): Promise<PostResponseDto> {
    const post = await this.findPostOrFail(id);
    return this.toPostResponse(post);
  }
}