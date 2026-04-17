import { UserRole, User } from './../../users/entities/user.entity';

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password',
  pseudonym: 'testuser',
  avatar: 'avatar_1',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
  posts: [],
  comments: [],
  ...overrides,
});