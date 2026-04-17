import { Post } from './../../posts/entities/post.entity';
import { createMockUser } from './user.factory';

export const createMockPost = (overrides?: Partial<Post>): Post => ({
  id: 1,
  content: 'Test post content',
  createdAt: new Date(),
  updatedAt: new Date(),
  author: createMockUser(),
  comments: [],
  ...overrides,
});