import { PostResponseDto } from './post-response.dto';
import { CommentResponseDto } from 'src/comments/dto/comment-response.dto';

export class PostDetailResponseDto extends PostResponseDto {
  comments!: CommentResponseDto[];
}