import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PaginatedPostFeedDto } from './dto/paginated-post-feed.dto';
import { PaginatedPostsDto } from './dto/paginated-posts.dto';
import { PostFeedDto } from './dto/post-feed-dto';
import { PostResponseDto } from './dto/post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ): Promise<PostResponseDto> {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedPostsDto> {
    return this.postsService.findAll(Number(page) || 1, Number(limit) || 10);
  }

  @Get('feed')
  findFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<PaginatedPostFeedDto> {
    return this.postsService.findFeed(Number(page) || 1, Number(limit) || 10);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PostResponseDto> {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePostDto,
    @Request() req,
  ): Promise<PostResponseDto> {
    return this.postsService.update(+id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<{ message: string }> {
    return this.postsService.remove(+id, req.user.userId, req.user.role);
  }
}
