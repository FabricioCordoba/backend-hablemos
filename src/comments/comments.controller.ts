import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Comment } from './entities/comment.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  // 🔥 CREATE
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateCommentDto, @Request() req): Promise<Comment> {
    return this.commentsService.create(dto, req.user.userId);
  }

  // 🔥 GET BY POST
  @Get('post/:postId')
  findByPost(@Param('postId') postId: string): Promise<Comment[]> {
    return this.commentsService.findByPost(+postId);
  }

  // 🔥 UPDATE
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Request() req,
  ): Promise<Comment> {
    return this.commentsService.update(+id, dto, req.user.userId);
  }

  // 🔥 DELETE
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    return this.commentsService.remove(+id, req.user.userId, req.user.role);
  }
}