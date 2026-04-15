import { UserRole } from 'src/users/entities/user.entity';

export class AuthorResponseDto {
  id!: number;
  email!: string;
  pseudonym!: string;
  avatar!: string;
  role!: UserRole;
  createdAt!: Date;
}

export class PostResponseDto {
  id!: number;
  content!: string;
  createdAt!: Date;
  author!: AuthorResponseDto;
}