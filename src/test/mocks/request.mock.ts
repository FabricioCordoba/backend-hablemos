import { UserRole } from 'src/users/entities/user.entity';

export const mockRequest = (userId = 1, role = UserRole.USER) => ({
  user: {
    userId,
    role,
  },
});