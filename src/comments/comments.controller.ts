import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateCommentDto, @Request() req): Promise<CommentResponseDto> {
    return this.commentsService.create(dto, req.user.userId);
  }

  @Get('post/:postId')
  findByPost(@Param('postId', ParseIntPipe) postId: number): Promise<CommentResponseDto[]> {
    return this.commentsService.findByPost(postId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @Request() req,
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req): Promise<{ message: string }> {
    return this.commentsService.remove(id, req.user.userId, req.user.role);
  }
}
