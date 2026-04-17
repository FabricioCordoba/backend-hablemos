import { Comment } from './../../comments/entities/comment.entity';
import { createMockUser } from './user.factory';
import { createMockPost } from './post.factory';

export const createMockComment = (overrides?: Partial<Comment>): Comment => ({
  id: 1,
  content: 'Test comment content',
  createdAt: new Date(),
  updatedAt: new Date(),
  author: createMockUser(),
  post: createMockPost(),
  ...overrides,
});