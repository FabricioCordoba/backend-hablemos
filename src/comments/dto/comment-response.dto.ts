import { AuthorPublicDto } from 'src/posts/dto/post-response.dto';

export class CommentResponseDto {
  id!: number;
  content!: string;
  createdAt!: Date;
  updatedAt!: Date;
  author!: AuthorPublicDto;
}
