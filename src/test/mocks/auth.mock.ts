import { UserRole } from 'src/users/entities/user.entity';

export const mockAuthUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password',
  role: UserRole.USER,
};