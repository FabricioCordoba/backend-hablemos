export class PostFeedDto {
  id!: number;
  content!: string;
  createdAt!: Date;

  author!: {
    id: number;
    pseudonym: string;
    avatar: string;
  };

  commentsCount!: number;
}