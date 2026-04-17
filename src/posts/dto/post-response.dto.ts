import { UserRole } from 'src/users/entities/user.entity';
import { CommentResponseDto } from 'src/comments/dto/comment-response.dto';



export class AuthorResponseDto {
  id!: number;
  email!: string;
  pseudonym!: string;
  avatar!: string;
  role!: UserRole;
  createdAt!: Date;
}
export class AuthorPublicDto {
  id!: number;
  pseudonym!: string;
  avatar!: string;
}

export class PostResponseDto {
  id!: number;
  content!: string;
  createdAt!: Date;
  author!: AuthorPublicDto;
  
}

