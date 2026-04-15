import {
  Controller,
  Get,
  Post,
  Request,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 🔥 CREATE
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ) {
    return this.postsService.create(
      createPostDto,
      req.user.userId,
    );
  }

  // 🔥 GET ALL
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  // 🔥 GET BY ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  // 🔥 UPDATE
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postsService.update(
      +id,
      updateDto,
      req.user.userId,
    );
  }

  // 🔥 DELETE
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.postsService.remove(
      +id,
      req.user.userId,
      req.user.role,
    );
  }
}