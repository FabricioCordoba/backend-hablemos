import { UserRole } from '../entities/user.entity';

export class PrivateUserProfileDto {
  id!: number;
  email!: string;
  pseudonym!: string;
  avatar!: string;
  createdAt!: Date;
  updatedAt!: Date;
  role!: UserRole;
}
