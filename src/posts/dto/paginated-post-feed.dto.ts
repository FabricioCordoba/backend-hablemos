import { PostFeedDto } from './post-feed-dto';

export class PaginatedPostFeedDto {
  data!: PostFeedDto[];
  total!: number;
  page!: number;
  lastPage!: number;
}
