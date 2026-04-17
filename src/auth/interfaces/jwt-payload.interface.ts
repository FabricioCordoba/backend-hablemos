import { UserRole } from "src/users/entities/user.entity";

export interface JwtUser {
  userId: number;
  role: UserRole;
}