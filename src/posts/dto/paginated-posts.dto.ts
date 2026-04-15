import { PostResponseDto } from './post-response.dto';

export class PaginatedPostsDto {
  data!: PostResponseDto[];
  total!: number;
  page!: number;
  lastPage!: number;
}